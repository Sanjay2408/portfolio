/**
 * Runs Lighthouse against the live site and prints a Markdown table of scores.
 * Used by .github/workflows/lighthouse.yml; runs locally too:
 *   node scripts/lighthouse.mjs https://sanjay-sg-portfolio.vercel.app
 * Exits non-zero if any category scores below MIN_SCORE.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'

const BASE = process.argv[2] ?? 'https://sanjay-sg-portfolio.vercel.app'
const PAGES = ['/', '/projects/risk-atlas', '/projects/intellicredit']
const FORM_FACTORS = ['mobile', 'desktop']
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']
const MIN_SCORE = 90

mkdirSync('lighthouse', { recursive: true })

const rows = []
for (const page of PAGES) {
  for (const formFactor of FORM_FACTORS) {
    const out = `lighthouse/${page.replaceAll('/', '_') || 'home'}-${formFactor}.json`
    execFileSync(
      'npx',
      [
        '--yes',
        'lighthouse@13',
        `${BASE}${page}`,
        '--quiet',
        '--output=json',
        `--output-path=${out}`,
        `--only-categories=${CATEGORIES.join(',')}`,
        '--chrome-flags=--headless=new --no-sandbox',
        ...(formFactor === 'desktop' ? ['--preset=desktop'] : []),
      ],
      { stdio: 'inherit', shell: process.platform === 'win32' },
    )
    const report = JSON.parse(readFileSync(out, 'utf8'))
    const scores = CATEGORIES.map((c) => Math.round(report.categories[c].score * 100))
    rows.push({
      page,
      formFactor,
      scores,
      lcp: report.audits['largest-contentful-paint'].displayValue,
    })
  }
}

const lines = [
  `| Page | Device | ${CATEGORIES.map((c) => c.replace('-', ' ')).join(' | ')} | LCP |`,
  `| --- | --- | ${CATEGORIES.map(() => '---').join(' | ')} | --- |`,
  ...rows.map((r) => `| \`${r.page}\` | ${r.formFactor} | ${r.scores.join(' | ')} | ${r.lcp} |`),
]
console.log(lines.join('\n'))

const failing = rows.filter((r) => r.scores.some((s) => s < MIN_SCORE))
if (failing.length > 0) {
  console.error(`\n${failing.length} run(s) scored below ${MIN_SCORE} in some category.`)
  process.exitCode = 1
}
