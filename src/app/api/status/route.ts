import { projects } from '@/content/projects'
import type { StatusResponse } from '@/lib/status'
import { checkAll, statusTargets } from '@/lib/status'

// Prerendered, then regenerated at most every 5 minutes. Visitors always get a
// cached response and never wait on, or trigger, a ping themselves.
export const dynamic = 'force-static'
export const revalidate = 300

/** Next caches fetch by default; a cached ping would report a fake latency. */
const uncachedFetch = (url: string, init: RequestInit) => fetch(url, { ...init, cache: 'no-store' })

export async function GET(): Promise<Response> {
  const body: StatusResponse = await checkAll(statusTargets(projects), { fetch: uncachedFetch })
  return Response.json(body)
}
