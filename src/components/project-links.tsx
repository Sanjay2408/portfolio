import Link from 'next/link'
import type { Project } from '@/content/types'
import { cn } from '@/lib/cn'
import { ExternalLink } from './external-link'
import { ArrowRight } from './icons'
import { StatusDot } from './status-dot'

const LINK =
  'underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent'

export const DOMAIN_LABEL: Record<Project['domain'], string> = {
  fintech: 'Fintech',
  health: 'Health',
  ml: 'ML',
  web: 'Web',
}

/** Where a project reference should point: its case study, or its row on the home page. */
export const projectHref = (project: Pick<Project, 'slug' | 'tier'>): string =>
  project.tier === 'more' ? `/#${project.slug}` : `/projects/${project.slug}`

interface ProjectLinksProps {
  readonly project: Project
  readonly showCaseStudy?: boolean
  readonly className?: string
}

/** Live link with status, repo link, credit and case study link, in that order. */
export function ProjectLinks({ project, showCaseStudy = true, className }: ProjectLinksProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 text-sm', className)}>
      {project.liveUrl && (
        <span className="inline-flex items-center gap-3">
          <ExternalLink href={project.liveUrl} className={cn('font-medium text-ink', LINK)}>
            Live
          </ExternalLink>
          <StatusDot slug={project.slug} />
        </span>
      )}
      {project.repo.visibility === 'public' ? (
        <ExternalLink href={project.repo.url} className={cn('text-ink-2', LINK)}>
          Code
        </ExternalLink>
      ) : (
        <span className="text-ink-3">Private repo</span>
      )}
      {project.credit && (
        <span className="text-ink-3">
          {project.credit.text}{' '}
          <ExternalLink href={project.credit.href} className={LINK}>
            {project.credit.label}
          </ExternalLink>
        </span>
      )}
      {showCaseStudy && project.caseStudy && (
        <Link
          href={`/projects/${project.slug}`}
          className="group inline-flex items-center gap-1 font-medium text-accent"
        >
          Case study
          <ArrowRight className="size-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" />
          <span className="sr-only">: {project.name}</span>
        </Link>
      )}
    </div>
  )
}
