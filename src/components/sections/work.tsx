import { featured, more } from '@/content/projects'
import { ProjectCard } from '../project-card'
import { ProjectRow } from '../project-row'
import { Section } from '../section'

export function Work() {
  return (
    <Section
      id="work"
      eyebrow="Work"
      title="What I built"
      intro="Each project names the problem, what I built, and the numbers behind it. Every number links to the file that produced it."
    >
      <div className="grid gap-x-12 gap-y-16 md:grid-cols-2">
        {featured.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      <h3 className="mt-24 text-xs font-medium tracking-[0.14em] text-ink-3 uppercase">
        Also built
      </h3>
      <ul className="mt-4">
        {more.map((project) => (
          <ProjectRow key={project.slug} project={project} />
        ))}
      </ul>
    </Section>
  )
}
