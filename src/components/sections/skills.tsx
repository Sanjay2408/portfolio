import Link from 'next/link'
import { profile } from '@/content/profile'
import { learningNow, shippedSkills } from '@/content/skills'
import { ExternalLink } from '../external-link'
import { projectHref } from '../project-links'
import { Section } from '../section'

const LINK =
  'underline decoration-rule underline-offset-2 transition-colors hover:text-accent hover:decoration-accent'

export function Skills() {
  const groups = shippedSkills()
  return (
    <Section
      id="skills"
      eyebrow="Skills"
      title="Shipped with"
      intro="Only what a project on this page uses, each linked to the projects that prove it."
    >
      <div className="grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.category}>
            <h3 className="border-b border-ink pb-2 text-xs font-medium tracking-[0.14em] text-ink-3 uppercase">
              {group.category}
            </h3>
            <ul>
              {group.skills.map((skill) => (
                <li key={skill.tech} className="border-b border-rule py-3">
                  <span className="font-medium">{skill.tech}</span>
                  <span className="mt-1 block text-sm text-ink-3">
                    {skill.provenBy.map((project, i) => (
                      <span key={project.slug}>
                        {i > 0 && ', '}
                        <Link href={projectHref(project)} className={LINK}>
                          {project.name}
                        </Link>
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-4 border-t border-ink pt-6 sm:grid-cols-[13rem_1fr]">
        <h3 className="text-xs font-medium tracking-[0.14em] text-ink-3 uppercase">Learning now</h3>
        <div>
          <p className="font-serif text-2xl">{learningNow.join(', ')}</p>
          <p className="mt-2 text-ink-2">
            This site is my TypeScript practice: strict mode, typed content, tested.{' '}
            <ExternalLink href={profile.links.source} className={LINK}>
              Read the source
            </ExternalLink>
          </p>
        </div>
      </div>
    </Section>
  )
}
