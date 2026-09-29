import { describe, expect, it, vi } from 'vitest'
import type { StatusResult } from './status'
import type { StatusSnapshot } from './status-client'
import { createStatusStore, describeStatus } from './status-client'

const result = (overrides: Partial<StatusResult>): StatusResult => ({
  slug: 'demo',
  url: 'https://demo.example',
  state: 'up',
  latencyMs: 120,
  httpStatus: 200,
  checkedAt: '2026-09-29T00:00:00.000Z',
  ...overrides,
})

const ready = (...results: StatusResult[]): StatusSnapshot => ({
  phase: 'ready',
  bySlug: new Map(results.map((r) => [r.slug, r])),
})

describe('createStatusStore', () => {
  it('starts loading and does not fetch until someone subscribes', () => {
    const load = vi.fn(async () => ({ checkedAt: '', results: [] }))
    const store = createStatusStore(load)
    expect(store.getSnapshot()).toEqual({ phase: 'loading' })
    expect(load).not.toHaveBeenCalled()
  })

  it('fetches once for many subscribers and notifies them all', async () => {
    const body = { checkedAt: 'x', results: [result({})] }
    const load = vi.fn(async () => body)
    const store = createStatusStore(load)
    const a = vi.fn()
    const b = vi.fn()
    store.subscribe(a)
    store.subscribe(b)
    await vi.waitFor(() => expect(store.getSnapshot().phase).toBe('ready'))
    expect(load).toHaveBeenCalledOnce()
    expect(a).toHaveBeenCalledOnce()
    expect(b).toHaveBeenCalledOnce()
    const snapshot = store.getSnapshot()
    expect(snapshot.phase === 'ready' && snapshot.bySlug.get('demo')?.latencyMs).toBe(120)
  })

  it('reports an error for a malformed body', async () => {
    const store = createStatusStore(async () => ({ nope: true }))
    store.subscribe(() => undefined)
    await vi.waitFor(() => expect(store.getSnapshot()).toEqual({ phase: 'error' }))
  })

  it('reports an error when the request fails', async () => {
    const store = createStatusStore(async () => {
      throw new Error('offline')
    })
    store.subscribe(() => undefined)
    await vi.waitFor(() => expect(store.getSnapshot()).toEqual({ phase: 'error' }))
  })

  it('stops notifying a listener after it unsubscribes', async () => {
    const store = createStatusStore(async () => ({ checkedAt: 'x', results: [] }))
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    unsubscribe()
    const other = vi.fn()
    store.subscribe(other)
    await vi.waitFor(() => expect(other).toHaveBeenCalled())
    expect(listener).not.toHaveBeenCalled()
  })

  it('renders as loading on the server', () => {
    expect(createStatusStore(async () => null).getServerSnapshot()).toEqual({ phase: 'loading' })
  })
})

describe('describeStatus', () => {
  it('says it is checking while loading', () => {
    expect(describeStatus({ phase: 'loading' }, 'demo')).toMatchObject({
      tone: 'unknown',
      text: 'Checking',
    })
  })

  it('admits when status could not be fetched', () => {
    expect(describeStatus({ phase: 'error' }, 'demo').text).toBe('Status unavailable')
  })

  it('handles a project the route did not check', () => {
    expect(describeStatus(ready(), 'demo').text).toBe('Not checked')
  })

  it('shows latency when up', () => {
    expect(describeStatus(ready(result({ latencyMs: 709 })), 'demo')).toEqual({
      tone: 'up',
      text: 'Up · 709 ms',
      label: 'Live and up, responded in 709 milliseconds',
    })
  })

  it('shows the timeout budget instead of calling a slow app down', () => {
    const view = describeStatus(ready(result({ state: 'timeout', latencyMs: null })), 'demo')
    expect(view).toMatchObject({ tone: 'timeout', text: 'No response in 8 s' })
  })

  it('shows the HTTP status when down', () => {
    const view = describeStatus(ready(result({ state: 'down', httpStatus: 503 })), 'demo')
    expect(view).toMatchObject({ tone: 'down', text: 'Down · 503' })
  })

  it('handles down with no response at all', () => {
    const view = describeStatus(
      ready(result({ state: 'down', httpStatus: null, latencyMs: null })),
      'demo',
    )
    expect(view).toMatchObject({ tone: 'down', text: 'Down', label: 'Down, could not connect' })
  })
})
