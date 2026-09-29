import { afterEach, describe, expect, it, vi } from 'vitest'
import { projects } from '@/content/projects'
import type { FetchLike } from '@/lib/status'
import { isStatusResponse } from '@/lib/status'
import { dynamic, GET, revalidate } from './route'

afterEach(() => vi.unstubAllGlobals())

describe('GET /api/status', () => {
  it('is cached and revalidated every 5 minutes', () => {
    expect(dynamic).toBe('force-static')
    expect(revalidate).toBe(300)
  })

  it('pings every project with a live URL, uncached, and returns a valid body', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await GET()
    const body: unknown = await response.json()

    const live = projects.filter((p) => p.liveUrl).map((p) => p.liveUrl)
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(live)
    for (const [, init] of fetchMock.mock.calls) expect(init.cache).toBe('no-store')
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(isStatusResponse(body)).toBe(true)
  })

  it('still answers 200 when every project is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed')
      }),
    )
    const response = await GET()
    const body = (await response.json()) as { results: { state: string }[] }
    expect(response.status).toBe(200)
    expect(body.results.every((r) => r.state === 'down')).toBe(true)
  })
})
