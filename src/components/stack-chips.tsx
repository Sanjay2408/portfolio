import type { Tech } from '@/content/tech'
import { cn } from '@/lib/cn'

export function StackChips({
  stack,
  className,
}: {
  readonly stack: readonly Tech[]
  readonly className?: string
}) {
  return (
    <ul aria-label="Stack" className={cn('flex flex-wrap gap-1.5', className)}>
      {stack.map((tech) => (
        <li key={tech} className="rounded-full bg-surface px-2.5 py-1 text-xs text-ink-2">
          {tech}
        </li>
      ))}
    </ul>
  )
}
