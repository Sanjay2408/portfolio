import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

// The shared store is a module singleton, so each test imports a fresh copy.
const freshStore = async () => (await import('./status-client')).statusStore

describe('statusStore', () => {
  it('loads /api/status on first subscribe', async () => {
    const fetchMock = vi.fn(async () => Response.json({ checkedAt: 'x', results: [] }))
    vi.stubGlobal('fetch', fetchMock)
    const store = await freshStore()
    store.subscribe(() => undefined)
    await vi.waitFor(() => expect(store.getSnapshot().phase).toBe('ready'))
    expect(fetchMock).toHaveBeenCalledWith('/api/status')
  })

  it('treats a non-2xx answer as an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 500 })),
    )
    const store = await freshStore()
    store.subscribe(() => undefined)
    await vi.waitFor(() => expect(store.getSnapshot()).toEqual({ phase: 'error' }))
  })
})
