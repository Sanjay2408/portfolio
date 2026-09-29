/**
 * RISK//ATLAS numbers, derived from the project's own evaluation report so the
 * portfolio cannot drift from it. The JSON is a verbatim copy of
 * Sanjay2408/Riskops docs/evaluation.json at commit 925aefa.
 */
import evaluation from './data/risk-atlas-evaluation.json'
import {
  formatCount,
  formatInr,
  formatMultiplier,
  formatPercent,
  formatRate,
  NOT_APPLICABLE as NA,
} from '@/lib/format'
import type { Metric, Table } from './types'

export const RISK_ATLAS_COMMIT = '925aefa5bba15b16c454194b2ba69800570b7cf5'
const REPO = 'https://github.com/Sanjay2408/Riskops'
const at = (path: string) => `${REPO}/blob/${RISK_ATLAS_COMMIT}/${path}`

export const EVALUATION_SOURCE = at('docs/evaluation.json')
export const README_SOURCE = at('README.md')
export const WHAT_BROKE_SOURCE = at('docs/WHAT_BROKE.md')
export const SPEC_SOURCE = at('docs/SPEC.md')

const { A, B, C, D, E } = evaluation.datasets

/** The attacker each dataset models, as labelled in the project README. */
const ATTACKER = {
  A: 'None (100% benign)',
  B: 'Crude',
  C: 'Unseen variant',
  D: 'Temporal holdout',
  E: 'Actively evasive',
} as const

/** Datasets that contain attack campaigns, in report order. A is benign-only. */
const CAMPAIGN_DATASETS = [
  ['B', B],
  ['C', C],
  ['D', D],
  ['E', E],
] as const

export const benignEventsInA = A.benign_events_scanned

export const headlineMetrics: readonly Metric[] = [
  {
    value: formatRate(E.txn_recall),
    label: 'transaction-level recall against the actively evasive attacker',
    source: EVALUATION_SOURCE,
  },
  {
    value: formatRate(E.campaign_f1),
    label: 'campaign-level F1 on the same data',
    source: EVALUATION_SOURCE,
  },
  {
    value: formatCount(A.false_campaigns),
    label: `false campaigns across ${formatCount(benignEventsInA)} benign events`,
    source: EVALUATION_SOURCE,
  },
]

export const evaluationTable: Table = {
  caption: 'Detection across five datasets',
  columns: [
    'Dataset',
    'Attacker',
    'Txn recall',
    'Invisibility',
    'Campaign P',
    'Campaign R',
    'Campaign F1',
    'False campaigns',
  ],
  rows: [
    ['A', ATTACKER.A, NA, NA, NA, NA, NA, formatCount(A.false_campaigns)],
    ...CAMPAIGN_DATASETS.map(([name, d]) => [
      name,
      ATTACKER[name],
      formatRate(d.txn_recall),
      formatPercent(d.invisibility),
      formatRate(d.campaign_precision),
      formatRate(d.campaign_recall),
      formatRate(d.campaign_f1),
      formatCount(d.false_campaigns),
    ]),
  ],
  highlightColumn: 6,
  source: EVALUATION_SOURCE,
}

export const falsePositiveCostTable: Table = {
  caption: 'False-positive cost, in rupees',
  columns: [
    'Dataset',
    'FP cost',
    'Fraud prevented',
    'Legit disrupted',
    'Net benefit',
    'Containment efficiency',
  ],
  rows: CAMPAIGN_DATASETS.map(([name, d]) => [
    name,
    formatInr(d.false_positive_cost_inr),
    formatInr(d.true_positive_fraud_prevented_inr),
    formatInr(d.true_positive_legit_disrupted_inr),
    formatInr(d.net_benefit_inr),
    formatMultiplier(d.mean_containment_efficiency),
  ]),
  highlightColumn: 1,
  source: EVALUATION_SOURCE,
}

/** Assumed vs measured realized-loss share on dataset B, the figure the README reports. */
export const lossCalibration = {
  assumed: formatRate(B.loss_calibration.assumed_realized_loss_share),
  measured: B.loss_calibration.measured_realized_loss_share.toFixed(3),
  errorPercent: `${Math.round(Math.abs(B.loss_calibration.relative_error) * 100)}%`,
} as const
