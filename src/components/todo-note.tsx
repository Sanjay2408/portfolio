import type { Todo } from '@/content/types'
import { cn } from '@/lib/cn'
import { SHOW_TODOS } from '@/lib/env'

/** A visible marker for copy the author still has to write. Renders nothing in production. */
export function TodoNote({
  todo,
  inline = false,
}: {
  readonly todo: Todo
  readonly inline?: boolean
}) {
  if (!SHOW_TODOS) return null
  const Tag = inline ? 'span' : 'p'
  return (
    <Tag
      className={cn(
        'border border-dashed border-accent text-sm text-accent',
        inline ? 'inline-block px-1.5 py-0.5' : 'block p-3',
      )}
    >
      <strong className="font-semibold">TODO</strong> {todo.note}
    </Tag>
  )
}
