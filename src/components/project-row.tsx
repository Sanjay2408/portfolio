import type { Metric, Project } from '@/content/types'
import { isTodo } from '@/content/types'
import { ExternalLink } from './external-link'
import { DOMAIN_LABEL, ProjectLinks } from './project-links'
import { StackChips } from './stack-chips'
import { TodoNote } from './todo-note'

/** A compact entry for the "also built" list. */
export function ProjectRow({ project }: { readonly project: Project }) {
  const metrics = project.metrics.filter((m): m is Metric => !isTodo(m))
  const todos = project.metrics.filter(isTodo)
  const titleId = `${project.slug}-row-title`

  return (
    <li
      id={project.slug}
      aria-labelledby={titleId}
      className="grid scroll-mt-8 gap-x-10 gap-y-3 border-t border-rule py-8 md:grid-cols-[13rem_1fr]"
    >
      <div>
        <h4 id={titleId} className="font-serif text-2xl font-medium tracking-tight">
          {project.name}
        </h4>
        <p className="mt-1 text-xs tracking-[0.14em] text-ink-3 uppercase">
          {DOMAIN_LABEL[project.domain]}
        </p>
      </div>
      <div className="min-w-0 space-y-3">
        <p className="text-ink-2">{project.problem}</p>
        <p className="leading-relaxed">{project.built}</p>
        {metrics.length > 0 && (
          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-2">
            {metrics.map((metric) => (
              <li key={metric.label}>
                <span className="font-serif text-lg font-medium text-ink tabular-nums">
                  {metric.value}
                </span>{' '}
                {metric.label}{' '}
                <ExternalLink
                  href={metric.source}
                  className="text-xs text-ink-3 underline decoration-rule underline-offset-2 hover:text-accent"
                >
                  source
                </ExternalLink>
              </li>
            ))}
          </ul>
        )}
        {todos.map((todo) => (
          <TodoNote key={todo.note} todo={todo} />
        ))}
        <StackChips stack={project.stack} />
        <ProjectLinks project={project} className="pt-1" />
      </div>
    </li>
  )
}
