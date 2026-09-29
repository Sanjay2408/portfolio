import { afterEach, describe, expect, it, vi } from 'vitest'
import { cn } from './cn'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

const load = async () => import('./env')

describe('SITE_URL', () => {
  it('prefers an explicit NEXT_PUBLIC_SITE_URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.dev')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'ignored.vercel.app')
    expect((await load()).SITE_URL).toBe('https://example.dev')
  })

  it('falls back to the Vercel production domain', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined)
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'portfolio.vercel.app')
    expect((await load()).SITE_URL).toBe('https://portfolio.vercel.app')
  })

  it('uses localhost when nothing is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined)
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', undefined)
    expect((await load()).SITE_URL).toBe('http://localhost:3000')
  })
})

describe('SHOW_TODOS', () => {
  it('hides TODO markers in production builds only', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect((await load()).SHOW_TODOS).toBe(false)
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'development')
    expect((await load()).SHOW_TODOS).toBe(true)
  })
})

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })
})
