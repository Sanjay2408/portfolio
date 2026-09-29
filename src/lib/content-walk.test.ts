import { describe, expect, it } from 'vitest'
import { todo } from '@/content/types'
import { collectStrings, collectTodos } from './content-walk'

const tree = {
  projects: [
    { slug: 'alpha', name: 'Alpha', role: todo('write role') },
    { slug: 'beta', tags: ['x', 'y'] },
  ],
  count: 3,
  missing: null,
}

describe('collectStrings', () => {
  it('finds nested strings with readable paths', () => {
    expect(collectStrings(tree)).toEqual([
      { path: 'projects[alpha].slug', value: 'alpha' },
      { path: 'projects[alpha].name', value: 'Alpha' },
      { path: 'projects[alpha].role.kind', value: 'todo' },
      { path: 'projects[alpha].role.note', value: 'write role' },
      { path: 'projects[beta].slug', value: 'beta' },
      { path: 'projects[beta].tags[0]', value: 'x' },
      { path: 'projects[beta].tags[1]', value: 'y' },
    ])
  })
})

describe('collectTodos', () => {
  it('finds TODO markers and where they sit', () => {
    expect(collectTodos(tree, 'content')).toEqual([
      { path: 'content.projects[alpha].role', value: { kind: 'todo', note: 'write role' } },
    ])
  })

  it('returns nothing for a tree with no TODOs', () => {
    expect(collectTodos({ a: [1, 'b'] })).toEqual([])
  })
})
