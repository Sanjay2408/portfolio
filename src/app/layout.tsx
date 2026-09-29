import type { Metadata, Viewport } from 'next'
import { Geist, Newsreader } from 'next/font/google'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ThemeScript } from '@/components/theme-script'
import { profile } from '@/content/profile'
import { SITE_URL } from '@/lib/env'
import './globals.css'

// Self-hosted and subset by next/font: no request to Google at runtime, no layout shift on swap.
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
// Weight axis only: the optical-size axis quadrupled the font file for a barely visible gain.
const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
})

const description = `${profile.headline} ${profile.about}`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: profile.name, template: `%s · ${profile.name}` },
  description,
  authors: [{ name: profile.name, url: profile.links.github }],
  openGraph: {
    type: 'website',
    siteName: profile.name,
    title: profile.name,
    description: profile.headline,
    url: '/',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfaf7' },
    { media: '(prefers-color-scheme: dark)', color: '#12110e' },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // The theme script sets data-theme before hydration, so the attribute differs from the server render by design.
    <html lang="en" className={`${geist.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-svh flex-col">
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
