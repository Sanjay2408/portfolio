import Link from 'next/link'
import { wins } from '@/content/profile'
import { isTodo } from '@/content/types'
import { Section } from '../section'
import { TodoNote } from '../todo-note'

export function Wins() {
  return (
    <Section id="wins" eyebrow="Wins" title="Competitions and credentials">
      <ol className="grid gap-x-12 sm:grid-cols-2">
        {wins.map((win) => (
          <li key={win.title} className="border-t border-rule py-6">
            <h3 className="font-serif text-2xl font-medium tracking-tight">
              {win.href ? (
                <Link
                  href={win.href}
                  className="underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  {win.title}
                </Link>
              ) : (
                win.title
              )}
            </h3>
            {isTodo(win.detail) ? (
              <div className="mt-2">
                <TodoNote todo={win.detail} />
              </div>
            ) : (
              <p className="mt-2 text-ink-2">{win.detail}</p>
            )}
          </li>
        ))}
      </ol>
    </Section>
  )
}
