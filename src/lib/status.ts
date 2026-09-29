/**
 * Uptime checks for live project URLs. Pure and dependency-injected so the
 * route handler stays thin and every branch is unit-tested.
 */

/** `timeout` is separate from `down`: a serverless app waking from a cold start is slow, not broken. */
export type StatusState = 'up' | 'down' | 'timeout'

export interface StatusResult {
  readonly slug: string
  readonly url: string
  readonly state: StatusState
  /** Time to response headers. Null when no response arrived. */
  readonly latencyMs: number | null
  readonly httpStatus: number | null
  readonly checkedAt: string
  /** True when the first attempt timed out and the result comes from the one retry. */
  readonly retried: boolean
}

export interface StatusResponse {
  readonly checkedAt: string
  readonly results: readonly StatusResult[]
}

export interface StatusTarget {
  readonly slug: string
  readonly url: string
}

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>

export interface CheckOptions {
  readonly timeoutMs?: number
  readonly fetch?: FetchLike
  /** Clock in milliseconds, injectable for tests. */
  readonly now?: () => number
}

export const DEFAULT_TIMEOUT_MS = 8_000
export const USER_AGENT = 'sanjay-portfolio-status/1.0 (+https://github.com/Sanjay2408/portfolio)'

class TimeoutError extends Error {
  override readonly name = 'TimeoutError'
}

type AttemptResult = Omit<StatusResult, 'retried'>

async function attempt(
  target: StatusTarget,
  { timeoutMs = DEFAULT_TIMEOUT_MS, fetch: fetchImpl = fetch, now = Date.now }: CheckOptions,
): Promise<AttemptResult> {
  const controller = new AbortController()
  const started = now()
  const checkedAt = new Date(started).toISOString()
  const base = { slug: target.slug, url: target.url, checkedAt }

  // Races the request so a fetch implementation that ignores the abort signal still times out.
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new TimeoutError(`No response within ${timeoutMs} ms`))
    }, timeoutMs)
  })

  try {
    const response = await Promise.race([
      fetchImpl(target.url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': USER_AGENT },
      }),
      deadline,
    ])
    const latencyMs = Math.max(0, Math.round(now() - started))
    // Headers are enough to judge health; do not download the page.
    await response.body?.cancel().catch(() => undefined)
    return {
      ...base,
      state: response.ok ? 'up' : 'down',
      latencyMs,
      httpStatus: response.status,
    }
  } catch (error) {
    const timedOut = error instanceof TimeoutError || controller.signal.aborted
    return { ...base, state: timedOut ? 'timeout' : 'down', latencyMs: null, httpStatus: null }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Checks one URL. A timeout gets exactly one retry, because the first request
 * is often what wakes a sleeping serverless function; the retry then measures
 * the app as a visitor would find it. Other failures are reported as they are.
 */
export async function checkUrl(
  target: StatusTarget,
  options: CheckOptions = {},
): Promise<StatusResult> {
  const first = await attempt(target, options)
  if (first.state !== 'timeout') return { ...first, retried: false }
  const second = await attempt(target, options)
  return { ...second, checkedAt: first.checkedAt, retried: true }
}

/** Checks every target in parallel. Never rejects: a failed check is reported, not thrown. */
export async function checkAll(
  targets: readonly StatusTarget[],
  options: CheckOptions = {},
): Promise<StatusResponse> {
  const now = options.now ?? Date.now
  const checkedAt = new Date(now()).toISOString()
  const settled = await Promise.allSettled(targets.map((target) => checkUrl(target, options)))
  const results = settled.map((outcome, i): StatusResult => {
    if (outcome.status === 'fulfilled') return outcome.value
    const target = targets[i]!
    return {
      ...target,
      state: 'down',
      latencyMs: null,
      httpStatus: null,
      checkedAt,
      retried: false,
    }
  })
  return { checkedAt, results }
}

/** The projects worth pinging: anything with a live URL. */
export function statusTargets(
  projects: readonly { readonly slug: string; readonly liveUrl?: string }[],
): readonly StatusTarget[] {
  return projects.flatMap((p) => (p.liveUrl ? [{ slug: p.slug, url: p.liveUrl }] : []))
}

const STATES: readonly string[] = ['up', 'down', 'timeout'] satisfies StatusState[]

const isNullableNumber = (v: unknown): v is number | null => v === null || typeof v === 'number'

function isStatusResult(value: unknown): value is StatusResult {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Record<string, unknown>
  return (
    typeof r.slug === 'string' &&
    typeof r.url === 'string' &&
    typeof r.state === 'string' &&
    STATES.includes(r.state) &&
    isNullableNumber(r.latencyMs) &&
    isNullableNumber(r.httpStatus) &&
    typeof r.checkedAt === 'string' &&
    typeof r.retried === 'boolean'
  )
}

/** Validates JSON from the network before the UI trusts it. */
export function isStatusResponse(value: unknown): value is StatusResponse {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Record<string, unknown>
  return (
    typeof r.checkedAt === 'string' && Array.isArray(r.results) && r.results.every(isStatusResult)
  )
}
