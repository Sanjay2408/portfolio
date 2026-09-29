import { describe, expect, it } from 'vitest'
import { collectStrings } from '@/lib/content-walk'
import { allContent } from './index'
import { profile } from './profile'
import { PORTFOLIO_SLUG, detailPageProjects, projects, shippedProjects } from './projects'
import { TECH } from './tech'
import type { Metric } from './types'
import { isTodo } from './types'

const GITHUB_REPO = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/
const HTTPS_URL = /^https:\/\/\S+$/
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Words the copy style bans. Matched as whole words, case-insensitive. */
const BANNED_WORDS = [
  'passionate',
  'cutting-edge',
  'leverage',
  'leveraging',
  'leveraged',
  'synergy',
  'innovative',
  'world-class',
  'revolutionary',
  'game-changing',
  'seamless',
  'seamlessly',
  'state-of-the-art',
  'next-gen',
  'stunning',
  'rockstar',
  'ninja',
  'guru',
]

const metricsOf = (metrics: (typeof projects)[number]['metrics']): Metric[] =>
  metrics.filter((m): m is Metric => !isTodo(m))

describe('projects', () => {
  it('have unique kebab-case slugs', () => {
    const slugs = projects.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(slug).toMatch(KEBAB)
  })

  it('have exactly one flagship', () => {
    expect(projects.filter((p) => p.tier === 'flagship')).toHaveLength(1)
  })

  it.each(projects.map((p) => [p.slug, p] as const))('%s links a repo', (_, project) => {
    if (project.repo.visibility === 'public') {
      expect(project.repo.url).toMatch(GITHUB_REPO)
    } else {
      // Private code must at least be verifiable as a live product.
      expect(project.liveUrl).toMatch(HTTPS_URL)
    }
  })

  it.each(projects.map((p) => [p.slug, p] as const))('%s lists a stack', (_, project) => {
    expect(project.stack.length).toBeGreaterThan(0)
    expect(new Set(project.stack).size).toBe(project.stack.length)
    for (const tech of project.stack) expect(TECH).toHaveProperty(tech)
  })

  it.each(projects.map((p) => [p.slug, p] as const))(
    '%s has one to three metrics or TODOs',
    (_, project) => {
      expect(project.metrics.length).toBeGreaterThanOrEqual(1)
      expect(project.metrics.length).toBeLessThanOrEqual(3)
    },
  )

  it.each(projects.map((p) => [p.slug, p] as const))(
    '%s cites a source for every number',
    (_, project) => {
      for (const metric of metricsOf(project.metrics)) {
        expect(metric.value.trim()).not.toBe('')
        expect(metric.label.trim()).not.toBe('')
        expect(metric.source).toMatch(HTTPS_URL)
      }
      for (const table of project.tables ?? []) {
        expect(table.source).toMatch(HTTPS_URL)
      }
    },
  )

  it('pin public source links to a commit so they cannot silently change', () => {
    const sources = projects.flatMap((p) => [
      ...metricsOf(p.metrics).map((m) => m.source),
      ...(p.tables ?? []).map((t) => t.source),
    ])
    for (const source of sources) {
      expect(source).toMatch(/\/blob\/[0-9a-f]{40}\//)
    }
  })

  it('use https for every live URL', () => {
    for (const project of projects) {
      if (project.liveUrl !== undefined) expect(project.liveUrl).toMatch(HTTPS_URL)
    }
  })

  it('give every table rows as wide as its columns', () => {
    for (const table of projects.flatMap((p) => p.tables ?? [])) {
      for (const row of table.rows) expect(row).toHaveLength(table.columns.length)
      if (table.highlightColumn !== undefined) {
        expect(table.highlightColumn).toBeLessThan(table.columns.length)
      }
    }
  })

  it('give the flagship and featured projects a case study', () => {
    for (const project of projects.filter((p) => p.tier !== 'more')) {
      expect(project.caseStudy, project.slug).toBeDefined()
    }
    expect(detailPageProjects.every((p) => p.tier !== 'more')).toBe(true)
  })
})

describe('architecture diagrams', () => {
  const diagrams = projects.flatMap((p) =>
    p.caseStudy ? [[p.slug, p.caseStudy.architecture] as const] : [],
  )

  it.each(diagrams)('%s has unique node ids and cells', (_, diagram) => {
    const ids = diagram.nodes.map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
    const cells = diagram.nodes.map((n) => `${n.col},${n.row}`)
    expect(new Set(cells).size).toBe(cells.length)
  })

  it.each(diagrams)('%s only connects nodes that exist', (_, diagram) => {
    const ids = new Set(diagram.nodes.map((n) => n.id))
    for (const edge of diagram.edges) {
      expect(ids.has(edge.from), edge.from).toBe(true)
      expect(ids.has(edge.to), edge.to).toBe(true)
      expect(edge.from).not.toBe(edge.to)
    }
  })

  it.each(diagrams)('%s describes itself for screen readers', (_, diagram) => {
    expect(diagram.description.length).toBeGreaterThan(40)
  })
})

describe('copy rules', () => {
  const strings = collectStrings(allContent)

  it('finds the copy to check', () => {
    expect(strings.length).toBeGreaterThan(100)
  })

  it('never uses an em dash', () => {
    const offenders = strings.filter((s) => s.value.includes('—'))
    expect(offenders.map((s) => s.path)).toEqual([])
  })

  it('never uses a banned buzzword', () => {
    const pattern = new RegExp(`(^|[^\\w-])(${BANNED_WORDS.join('|')})(?![\\w-])`, 'i')
    const offenders = strings.filter((s) => !s.path.endsWith('href') && pattern.test(s.value))
    expect(offenders.map((s) => `${s.path}: ${s.value}`)).toEqual([])
  })
})

describe('hero', () => {
  it('counts every shipped project except this site', () => {
    expect(shippedProjects.some((p) => p.slug === PORTFOLIO_SLUG)).toBe(false)
    expect(profile.headline).toContain(`${shippedProjects.length} projects`)
  })
})
