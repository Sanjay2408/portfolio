/**
 * Lists every TODO in the site content, grouped by where it sits.
 * Run with `npm run todos`. Exits non-zero with --strict when any remain.
 */
import { allContent } from '../src/content'
import { collectTodos } from '../src/lib/content-walk'

const todos = collectTodos(allContent)

if (todos.length === 0) {
  console.log('No TODOs left.')
} else {
  console.log(`${todos.length} TODOs\n`)
  for (const { path, value } of todos) {
    console.log(`- ${path}\n  ${value.note}\n`)
  }
}

if (process.argv.includes('--strict') && todos.length > 0) process.exitCode = 1
