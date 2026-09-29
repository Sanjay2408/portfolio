import type { Todo } from '@/content/types'
import { isTodo } from '@/content/types'

export interface Found<T> {
  /** Readable location, e.g. `projects[dosewise].caseStudy.role`. */
  readonly path: string
  readonly value: T
}

const keyFor = (item: unknown, index: number): string => {
  if (typeof item === 'object' && item !== null && 'slug' in item) {
    const slug = (item as { slug: unknown }).slug
    if (typeof slug === 'string') return slug
  }
  return String(index)
}

/** Depth-first visit of every value in a plain data tree. */
export function walk(
  value: unknown,
  visit: (value: unknown, path: string) => void,
  path = '',
): void {
  visit(value, path)
  if (Array.isArray(value)) {
    value.forEach((item, i) => walk(item, visit, `${path}[${keyFor(item, i)}]`))
  } else if (typeof value === 'object' && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      walk(child, visit, path ? `${path}.${key}` : key)
    }
  }
}

export function collectStrings(value: unknown, root = ''): readonly Found<string>[] {
  const found: Found<string>[] = []
  walk(
    value,
    (v, path) => {
      if (typeof v === 'string') found.push({ path, value: v })
    },
    root,
  )
  return found
}

export function collectTodos(value: unknown, root = ''): readonly Found<Todo>[] {
  const found: Found<Todo>[] = []
  walk(
    value,
    (v, path) => {
      if (isTodo(v)) found.push({ path, value: v })
    },
    root,
  )
  return found
}
