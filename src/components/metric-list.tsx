import type { Metric, Todo } from '@/content/types'
import { isTodo } from '@/content/types'
import { cn } from '@/lib/cn'
import { ExternalLink } from './external-link'
import { TodoNote } from './todo-note'

interface MetricListProps {
  readonly metrics: readonly (Metric | Todo)[]
  readonly size?: 'lg' | 'md' | 'sm'
  readonly className?: string
}

const VALUE_SIZE = {
  lg: 'text-5xl sm:text-6xl',
  md: 'text-3xl',
  sm: 'text-2xl',
} as const

const GRID = {
  lg: 'sm:grid-cols-3',
  md: 'grid-cols-2 sm:grid-cols-3',
  sm: 'grid-cols-2 sm:grid-cols-3',
} as const

/** Numbers, each with a link to the file that proves it. */
export function MetricList({ metrics, size = 'md', className }: MetricListProps) {
  const real = metrics.filter((m): m is Metric => !isTodo(m))
  const todos = metrics.filter(isTodo)
  if (real.length === 0 && todos.length === 0) return null

  return (
    <div className={cn('space-y-3', className)}>
      {real.length > 0 && (
        <dl className={cn('grid gap-x-8 gap-y-6', GRID[size])}>
          {real.map((metric) => (
            // Label first in the DOM so a screen reader says what the number means before the number.
            <div key={metric.label} className="flex flex-col-reverse justify-end gap-2">
              <dt className="text-sm leading-snug text-ink-2">
                {metric.label}{' '}
                <ExternalLink
                  href={metric.source}
                  className="text-xs whitespace-nowrap text-ink-3 underline decoration-rule underline-offset-2 hover:text-accent hover:decoration-accent"
                >
                  source
                </ExternalLink>
              </dt>
              <dd
                className={cn(
                  'font-serif leading-none font-medium tracking-tight tabular-nums',
                  VALUE_SIZE[size],
                )}
              >
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {todos.map((todo) => (
        <TodoNote key={todo.note} todo={todo} />
      ))}
    </div>
  )
}
