import { describe, expect, it } from 'vitest'
import evaluation from './data/risk-atlas-evaluation.json'
import {
  benignEventsInA,
  evaluationTable,
  falsePositiveCostTable,
  headlineMetrics,
  lossCalibration,
} from './risk-atlas'

describe('RISK//ATLAS numbers', () => {
  it('reads the headline straight from the evaluation report', () => {
    expect(headlineMetrics.map((m) => m.value)).toEqual(['0.005', '1.00', '0'])
    expect(benignEventsInA).toBe(4573)
    expect(headlineMetrics[2]?.label).toContain('4,573 benign events')
  })

  it('matches the README evaluation table', () => {
    expect(evaluationTable.rows).toEqual([
      ['A', 'None (100% benign)', 'n/a', 'n/a', 'n/a', 'n/a', 'n/a', '0'],
      ['B', 'Crude', '0.58', '41.7%', '1.00', '1.00', '1.00', '0'],
      ['C', 'Unseen variant', '0.05', '95.0%', '0.75', '1.00', '0.86', '1'],
      ['D', 'Temporal holdout', '0.49', '51.2%', '1.00', '1.00', '1.00', '0'],
      ['E', 'Actively evasive', '0.005', '99.5%', '1.00', '1.00', '1.00', '0'],
    ])
  })

  it('matches the README rupee cost table', () => {
    expect(falsePositiveCostTable.rows).toEqual([
      ['B', '₹0', '₹594,799', '₹1,597', '₹593,202', '377×'],
      ['C', '₹1,712', '₹472,878', '₹6,855', '₹464,311', '82×'],
      ['D', '₹0', '₹394,967', '₹1,887', '₹393,080', '337×'],
      ['E', '₹0', '₹31,103', '₹15,632', '₹15,470', '2.18×'],
    ])
  })

  it('reports the loss-constant error the README discloses', () => {
    expect(lossCalibration).toEqual({ assumed: '0.65', measured: '0.796', errorPercent: '18%' })
  })

  it('is pinned to the evaluation run it was copied from', () => {
    expect(evaluation.generated_at).toBe('2026-08-25T07:58:42.577913')
  })
})
