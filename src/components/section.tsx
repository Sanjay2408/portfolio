import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SectionProps {
  readonly id: string
  readonly eyebrow: string
  readonly title: ReactNode
  readonly intro?: ReactNode
  readonly children: ReactNode
  readonly className?: string
}

export function Eyebrow({
  children,
  className,
}: {
  readonly children: ReactNode
  readonly className?: string
}) {
  return (
    <p className={cn('text-xs font-medium tracking-[0.14em] text-ink-3 uppercase', className)}>
      {children}
    </p>
  )
}

export function Section({ id, eyebrow, title, intro, children, className }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn('scroll-mt-8 border-t border-rule py-20 sm:py-28', className)}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        id={`${id}-title`}
        className="mt-3 max-w-3xl font-serif text-4xl leading-[1.05] font-medium tracking-tight sm:text-5xl"
      >
        {title}
      </h2>
      {intro && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">{intro}</div>}
      <div className="mt-12">{children}</div>
    </section>
  )
}
