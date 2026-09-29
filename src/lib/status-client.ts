/**
 * Client-side view of /api/status: one shared fetch for every status dot on
 * the page, exposed as an external store for useSyncExternalStore, plus the
 * pure mapping from a result to what the dot says.
 */
import type { StatusResult } from './status'
import { DEFAULT_TIMEOUT_MS, isStatusResponse } from './status'

export type StatusSnapshot =
  | { readonly phase: 'loading' }
  | { readonly phase: 'error' }
  | { readonly phase: 'ready'; readonly bySlug: ReadonlyMap<string, StatusResult> }

export interface StatusStore {
  subscribe(listener: () => void): () => void
  getSnapshot(): StatusSnapshot
  getServerSnapshot(): StatusSnapshot
}

const LOADING: StatusSnapshot = { phase: 'loading' }

/** Loads lazily on first subscribe, once per page. */
export function createStatusStore(load: () => Promise<unknown>): StatusStore {
  let snapshot: StatusSnapshot = LOADING
  let started = false
  const listeners = new Set<() => void>()

  const settle = (next: StatusSnapshot) => {
    snapshot = next
    for (const listener of listeners) listener()
  }

  const start = () => {
    started = true
    load()
      .then((json) => {
        if (!isStatusResponse(json)) throw new Error('Malformed status response')
        settle({ phase: 'ready', bySlug: new Map(json.results.map((r) => [r.slug, r])) })
      })
      .catch(() => settle({ phase: 'error' }))
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      if (!started) start()
      return () => listeners.delete(listener)
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => LOADING,
  }
}

export const statusStore = createStatusStore(async () => {
  const response = await fetch('/api/status')
  if (!response.ok) throw new Error(`Status route answered ${response.status}`)
  return response.json()
})

export type StatusTone = 'up' | 'down' | 'timeout' | 'unknown'

export interface StatusView {
  readonly tone: StatusTone
  /** Short visible text. */
  readonly text: string
  /** Full sentence for screen readers. */
  readonly label: string
}

const TIMEOUT_SECONDS = DEFAULT_TIMEOUT_MS / 1000

export function describeStatus(snapshot: StatusSnapshot, slug: string): StatusView {
  if (snapshot.phase === 'loading') {
    return { tone: 'unknown', text: 'Checking', label: 'Checking live status' }
  }
  if (snapshot.phase === 'error') {
    return { tone: 'unknown', text: 'Status unavailable', label: 'Live status unavailable' }
  }
  const result = snapshot.bySlug.get(slug)
  if (result === undefined) {
    return { tone: 'unknown', text: 'Not checked', label: 'Live status not checked' }
  }
  switch (result.state) {
    case 'up':
      return result.retried
        ? {
            tone: 'up',
            text: `Up · ${result.latencyMs} ms · 2nd try`,
            label: `Live and up, responded in ${result.latencyMs} milliseconds on a second try after the first timed out`,
          }
        : {
            tone: 'up',
            text: `Up · ${result.latencyMs} ms`,
            label: `Live and up, responded in ${result.latencyMs} milliseconds`,
          }
    case 'timeout':
      return {
        tone: 'timeout',
        text: `No response in ${TIMEOUT_SECONDS} s`,
        label: `No response within ${TIMEOUT_SECONDS} seconds, twice`,
      }
    case 'down':
      return {
        tone: 'down',
        text: result.httpStatus === null ? 'Down' : `Down · ${result.httpStatus}`,
        label:
          result.httpStatus === null
            ? 'Down, could not connect'
            : `Down, answered HTTP ${result.httpStatus}`,
      }
  }
}
