import type { Project } from '@/content/types'
import { Eyebrow } from './section'
import { MetricList } from './metric-list'
import { DOMAIN_LABEL, ProjectLinks } from './project-links'
import { StackChips } from './stack-chips'

/** A featured project: problem, what I built, numbers, stack, links. */
export function ProjectCard({ project }: { readonly project: Project }) {
  const titleId = `${project.slug}-card-title`
  return (
    <article
      id={project.slug}
      aria-labelledby={titleId}
      className="flex scroll-mt-8 flex-col border-t border-ink pt-6"
    >
      <Eyebrow>
        {DOMAIN_LABEL[project.domain]}
        {project.context && (
          <span className="tracking-normal normal-case"> · {project.context}</span>
        )}
      </Eyebrow>
      <h3 id={titleId} className="mt-3 font-serif text-3xl font-medium tracking-tight">
        {project.name}
      </h3>
      <p className="mt-3 text-base leading-relaxed text-ink-2">{project.problem}</p>
      <p className="mt-3 leading-relaxed">{project.built}</p>
      <MetricList metrics={project.metrics} size="sm" className="mt-7" />
      <StackChips stack={project.stack} className="mt-7" />
      <ProjectLinks project={project} className="mt-auto pt-7" />
    </article>
  )
}
