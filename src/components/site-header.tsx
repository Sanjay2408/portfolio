import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'

const NAV = [
  { href: '/#work', label: 'Work' },
  { href: '/#skills', label: 'Skills' },
  { href: '/#wins', label: 'Wins' },
  { href: '/#design', label: 'Design' },
  { href: '/#contact', label: 'Contact' },
] as const

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
      <a
        href="#main"
        className="sr-only rounded bg-accent px-3 py-2 text-sm font-medium text-on-accent focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>
      <Link href="/" className="font-serif text-lg font-medium tracking-tight">
        Sanjay S G
      </Link>
      <nav aria-label="Primary" className="flex items-center gap-1">
        <ul className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="rounded-full px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-surface hover:text-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <ThemeToggle />
      </nav>
    </header>
  )
}
