/** TODO markers render only outside production builds. */
export const SHOW_TODOS = process.env.NODE_ENV !== 'production'

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000')
