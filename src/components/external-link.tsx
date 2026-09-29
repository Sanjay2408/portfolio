import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ArrowUpRight } from './icons'

interface ExternalLinkProps {
  readonly href: string
  readonly children: ReactNode
  readonly className?: string
  /** Hide the arrow, e.g. inside a button that already signals an action. */
  readonly bare?: boolean
}

export function ExternalLink({ href, children, className, bare = false }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('group inline-flex items-center gap-1', className)}
    >
      {children}
      {!bare && (
        <ArrowUpRight className="size-3.5 shrink-0 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
      )}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
