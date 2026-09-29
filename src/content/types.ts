import type { Tech } from './tech'

/**
 * A gap only the author can fill. Shown with a dashed outline in development,
 * omitted in production, and listed by `npm run todos`.
 */
export interface Todo {
  readonly kind: 'todo'
  readonly note: string
}

export const todo = (note: string): Todo => ({ kind: 'todo', note })

export const isTodo = (value: unknown): value is Todo =>
  typeof value === 'object' && value !== null && (value as { kind?: unknown }).kind === 'todo'

/** Content that may not be written yet. */
export type Maybe<T> = T | Todo

export interface Metric {
  /** Display value, formatted as it should appear, e.g. "0.005" or "₹593,202". */
  readonly value: string
  readonly label: string
  /** Permalink to the file that proves the number. */
  readonly source: string
}

export type Repo =
  { readonly visibility: 'public'; readonly url: string } | { readonly visibility: 'private' }

export type Domain = 'fintech' | 'health' | 'ml' | 'web'

/** Flagship gets its own section, featured get full cards and a case study, more get one line. */
export type Tier = 'flagship' | 'featured' | 'more'

export interface Link {
  readonly label: string
  readonly href: string
}

export interface Table {
  readonly caption: string
  readonly columns: readonly string[]
  readonly rows: readonly (readonly string[])[]
  readonly source: string
  /** Index of a column to emphasise, e.g. the headline metric. */
  readonly highlightColumn?: number
}

export interface DiagramNode {
  readonly id: string
  readonly label: string
  readonly detail?: string
  /** Grid position. Columns flow left to right, rows top to bottom. */
  readonly col: number
  readonly row: number
}

export interface DiagramEdge {
  readonly from: string
  readonly to: string
  readonly label?: string
}

export interface Diagram {
  /** Read by screen readers in place of the drawing. */
  readonly description: string
  readonly nodes: readonly DiagramNode[]
  readonly edges: readonly DiagramEdge[]
}

export interface Decision {
  readonly title: string
  readonly body: string
}

export interface Incident {
  readonly title: string
  readonly symptom: string
  readonly fix: string
}

export interface CaseStudy {
  readonly problem: string
  readonly role: Maybe<string>
  readonly architecture: Diagram
  readonly decisions: readonly Decision[]
  readonly broke: Maybe<readonly Incident[]>
  readonly next: Maybe<readonly string[]>
}

export interface Project {
  readonly slug: string
  readonly name: string
  readonly tier: Tier
  readonly domain: Domain
  /** The problem, in one line. */
  readonly problem: string
  /** What I built, in one or two sentences. */
  readonly built: string
  readonly stack: readonly Tech[]
  /** One to three numbers, each with a source. A Todo marks a number still to be measured. */
  readonly metrics: readonly (Metric | Todo)[]
  readonly liveUrl?: string
  readonly repo: Repo
  /** Where or why it was built, e.g. a hackathon. */
  readonly context?: string
  /** Credit for work this project builds on. */
  readonly credit?: Link & { readonly text: string }
  readonly tables?: readonly Table[]
  readonly caseStudy?: CaseStudy
}
