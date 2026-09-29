import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchLike, StatusResult } from './status'
import {
  checkAll,
  checkUrl,
  DEFAULT_TIMEOUT_MS,
  isStatusResponse,
  statusTargets,
  USER_AGENT,
} from './status'

const target = { slug: 'demo', url: 'https://demo.example' }

/** A clock that advances by `step` ms on every read. */
const steppingClock = (start: number, step: number) => {
  let t = start - step
  return () => (t += step)
}

const respond =
  (status: number): FetchLike =>
  async () =>
    new Response('body', { status })

/** A fetch that only settles when aborted, like a real request to a sleeping server. */
const hangUntilAborted: FetchLike = (_url, init) =>
  new Promise((_, reject) => {
    init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
  })

/** A fetch that ignores the abort signal entirely. */
const hangForever: FetchLike = () => new Promise(() => undefined)

describe('checkUrl', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('reports up with latency for a 2xx response', async () => {
    const result = await checkUrl(target, { fetch: respond(200), now: steppingClock(1_000, 142) })
    expect(result).toEqual<StatusResult>({
      slug: 'demo',
      url: 'https://demo.example',
      state: 'up',
      latencyMs: 142,
      httpStatus: 200,
      checkedAt: new Date(1_000).toISOString(),
      retried: false,
    })
  })

  it('reports down, with the status code, for a 5xx response', async () => {
    const result = await checkUrl(target, { fetch: respond(503) })
    expect(result.state).toBe('down')
    expect(result.httpStatus).toBe(503)
    expect(result.latencyMs).not.toBeNull()
  })

  it('reports down for a 404', async () => {
    const result = await checkUrl(target, { fetch: respond(404) })
    expect(result.state).toBe('down')
  })

  it('reports down with no latency when the request fails outright', async () => {
    const failing: FetchLike = async () => {
      throw new TypeError('fetch failed')
    }
    const result = await checkUrl(target, { fetch: failing })
    expect(result).toMatchObject({ state: 'down', latencyMs: null, httpStatus: null })
  })

  it('reports timeout, not down, when both attempts go unanswered', async () => {
    const spy = vi.fn<FetchLike>(hangUntilAborted)
    const pending = checkUrl(target, { fetch: spy, timeoutMs: 5_000 })
    await vi.advanceTimersByTimeAsync(10_000)
    expect(await pending).toMatchObject({
      state: 'timeout',
      latencyMs: null,
      httpStatus: null,
      retried: true,
    })
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('retries once after a timeout and reports the warm response', async () => {
    let calls = 0
    const coldThenWarm: FetchLike = (url, init) => {
      calls += 1
      return calls === 1 ? hangUntilAborted(url, init) : respond(200)(url, init)
    }
    const pending = checkUrl(target, { fetch: coldThenWarm, timeoutMs: 5_000 })
    await vi.advanceTimersByTimeAsync(5_000)
    expect(await pending).toMatchObject({ state: 'up', httpStatus: 200, retried: true })
    expect(calls).toBe(2)
  })

  it('does not retry a failure that is not a timeout', async () => {
    const spy = vi.fn<FetchLike>(respond(503))
    const result = await checkUrl(target, { fetch: spy })
    expect(result).toMatchObject({ state: 'down', retried: false })
    expect(spy).toHaveBeenCalledOnce()
  })

  it('still times out when the fetch ignores the abort signal', async () => {
    const pending = checkUrl(target, { fetch: hangForever })
    await vi.advanceTimersByTimeAsync(DEFAULT_TIMEOUT_MS * 2)
    expect((await pending).state).toBe('timeout')
  })

  it('does not time out a response that arrives just before the deadline', async () => {
    const slow: FetchLike = () =>
      new Promise((resolve) => setTimeout(() => resolve(new Response(null)), 4_999))
    const pending = checkUrl(target, { fetch: slow, timeoutMs: 5_000 })
    await vi.advanceTimersByTimeAsync(4_999)
    expect((await pending).state).toBe('up')
  })

  it('clears its timer once the check settles', async () => {
    await checkUrl(target, { fetch: respond(200) })
    expect(vi.getTimerCount()).toBe(0)
  })

  it('sends a GET with an abort signal and an identifying user agent', async () => {
    const spy = vi.fn<FetchLike>(respond(200))
    await checkUrl(target, { fetch: spy })
    const [url, init] = spy.mock.calls[0]!
    expect(url).toBe('https://demo.example')
    expect(init.method).toBe('GET')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(init.headers).toEqual({ 'user-agent': USER_AGENT })
  })

  it('does not download the response body', async () => {
    const cancel = vi.fn(async () => undefined)
    const fetchWithBody: FetchLike = async () =>
      ({ ok: true, status: 200, body: { cancel } }) as unknown as Response
    await checkUrl(target, { fetch: fetchWithBody })
    expect(cancel).toHaveBeenCalledOnce()
  })
})

describe('checkAll', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const targets = [
    { slug: 'up', url: 'https://up.example' },
    { slug: 'down', url: 'https://down.example' },
    { slug: 'slow', url: 'https://slow.example' },
  ]

  const byHost: FetchLike = (url, init) => {
    if (url.includes('up')) return respond(200)(url, init)
    if (url.includes('down')) return respond(500)(url, init)
    return hangUntilAborted(url, init)
  }

  it('checks targets in parallel and keeps their order', async () => {
    const pending = checkAll(targets, { fetch: byHost, timeoutMs: 1_000 })
    // Two timeout windows (attempt plus retry) cover all three, so the checks ran concurrently.
    await vi.advanceTimersByTimeAsync(2_000)
    const { results } = await pending
    expect(results.map((r) => [r.slug, r.state])).toEqual([
      ['up', 'up'],
      ['down', 'down'],
      ['slow', 'timeout'],
    ])
  })

  it('returns an empty list for no targets', async () => {
    expect((await checkAll([])).results).toEqual([])
  })

  it('never rejects, even if a check throws synchronously', async () => {
    const exploding = (() => {
      throw new Error('boom')
    }) as unknown as FetchLike
    const { results } = await checkAll([target], { fetch: exploding })
    expect(results[0]?.state).toBe('down')
  })

  it('reports a check that fails before it starts as down', async () => {
    let reads = 0
    const clockThatBreaks = () => {
      reads += 1
      if (reads > 1) throw new Error('clock unavailable')
      return 0
    }
    const { results } = await checkAll([target], { fetch: respond(200), now: clockThatBreaks })
    expect(results).toEqual([
      {
        ...target,
        state: 'down',
        latencyMs: null,
        httpStatus: null,
        checkedAt: new Date(0).toISOString(),
        retried: false,
      },
    ])
  })
})

describe('statusTargets', () => {
  it('keeps only projects with a live URL', () => {
    expect(
      statusTargets([
        { slug: 'a', liveUrl: 'https://a.example' },
        { slug: 'b' },
        { slug: 'c', liveUrl: 'https://c.example' },
      ]),
    ).toEqual([
      { slug: 'a', url: 'https://a.example' },
      { slug: 'c', url: 'https://c.example' },
    ])
  })
})

describe('isStatusResponse', () => {
  const valid = {
    checkedAt: '2026-09-29T00:00:00.000Z',
    results: [
      {
        slug: 'a',
        url: 'https://a.example',
        state: 'up',
        latencyMs: 120,
        httpStatus: 200,
        checkedAt: '2026-09-29T00:00:00.000Z',
        retried: false,
      },
      {
        slug: 'b',
        url: 'https://b.example',
        state: 'timeout',
        latencyMs: null,
        httpStatus: null,
        checkedAt: '2026-09-29T00:00:00.000Z',
        retried: false,
      },
    ],
  }

  it('accepts a well-formed response', () => {
    expect(isStatusResponse(valid)).toBe(true)
  })

  it.each([
    ['null', null],
    ['a string', 'ok'],
    ['missing results', { checkedAt: valid.checkedAt }],
    ['an unknown state', { ...valid, results: [{ ...valid.results[0], state: 'degraded' }] }],
    ['a string latency', { ...valid, results: [{ ...valid.results[0], latencyMs: '120' }] }],
    ['a missing slug', { ...valid, results: [{ ...valid.results[0], slug: undefined }] }],
    [
      'a missing retried flag',
      { ...valid, results: [{ ...valid.results[0], retried: undefined }] },
    ],
  ])('rejects %s', (_, value) => {
    expect(isStatusResponse(value)).toBe(false)
  })
})
