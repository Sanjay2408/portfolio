import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { ArchitectureDiagram } from '@/components/architecture-diagram'
import { DataTable } from '@/components/data-table'
import { ExternalLink } from '@/components/external-link'
import { ArrowLeft, ArrowRight } from '@/components/icons'
import { MetricList } from '@/components/metric-list'
import { DOMAIN_LABEL, ProjectLinks } from '@/components/project-links'
import { Eyebrow } from '@/components/section'
import { StackChips } from '@/components/stack-chips'
import { TodoNote } from '@/components/todo-note'
import { detailPageProjects, getProject } from '@/content/projects'
import type { Maybe } from '@/content/types'
import { isTodo } from '@/content/types'
import { SHOW_TODOS } from '@/lib/env'

export const dynamicParams = false

export function generateStaticParams() {
  return detailPageProjects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return {
    title: project.name,
    description: `${project.problem} ${project.built}`,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { title: project.name, description: project.problem, url: `/projects/${slug}` },
  }
}

interface CaseSectionProps<T> {
  readonly id: string
  readonly title: string
  readonly content: Maybe<T>
  readonly children: (content: T) => ReactNode
}

/** A titled case-study section. A TODO renders as a marker in development and disappears in production. */
function CaseSection<T>({ id, title, content, children }: CaseSectionProps<T>) {
  if (isTodo(content) && !SHOW_TODOS) return null
  return (
    <section
      aria-labelledby={id}
      className="grid gap-4 border-t border-rule py-12 lg:grid-cols-[14rem_1fr] lg:gap-12"
    >
      <h2 id={id} className="text-xs font-medium tracking-[0.14em] text-ink-3 uppercase lg:pt-1.5">
        {title}
      </h2>
      <div className="min-w-0">
        {isTodo(content) ? <TodoNote todo={content} /> : children(content)}
      </div>
    </section>
  )
}

export default async function ProjectPage({ params }: PageProps<'/projects/[slug]'>) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project?.caseStudy) notFound()
  const { caseStudy } = project

  const index = detailPageProjects.findIndex((p) => p.slug === slug)
  const nextProject = detailPageProjects[(index + 1) % detailPageProjects.length]

  return (
    <article className="pb-16">
      <Link
        href="/#work"
        className="group mt-4 inline-flex items-center gap-1.5 text-sm text-ink-2 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5 transition-transform motion-safe:group-hover:-translate-x-0.5" />
        All work
      </Link>

      <header className="pt-12 pb-16">
        <Eyebrow>
          {DOMAIN_LABEL[project.domain]}
          {project.context && (
            <span className="tracking-normal normal-case"> · {project.context}</span>
          )}
        </Eyebrow>
        <h1 className="mt-4 font-serif text-5xl leading-none font-medium tracking-tight sm:text-7xl">
          {project.name}
        </h1>
        <p className="mt-8 max-w-3xl font-serif text-2xl leading-snug sm:text-3xl">
          {project.problem}
        </p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">{project.built}</p>
        <MetricList metrics={project.metrics} size="md" className="mt-12" />
        <div className="mt-10 space-y-5">
          <StackChips stack={project.stack} />
          <ProjectLinks project={project} showCaseStudy={false} />
        </div>
      </header>

      <CaseSection id="problem" title="The problem" content={caseStudy.problem}>
        {(problem) => <p className="max-w-2xl text-lg leading-relaxed">{problem}</p>}
      </CaseSection>

      <CaseSection id="role" title="My role" content={caseStudy.role}>
        {(role) => <p className="max-w-2xl text-lg leading-relaxed">{role}</p>}
      </CaseSection>

      {project.screenshot && (
        <figure className="border-t border-rule py-12">
          <Image
            src={project.screenshot.src}
            width={project.screenshot.width}
            height={project.screenshot.height}
            alt={project.screenshot.alt}
            sizes="(min-width: 1152px) 1088px, 100vw"
            className="h-auto w-full rounded-lg border border-rule"
          />
          <figcaption className="mt-3 text-sm text-ink-3">
            The live app.{' '}
            {project.liveUrl && (
              <ExternalLink
                href={project.liveUrl}
                className="underline decoration-rule underline-offset-2 hover:text-accent"
              >
                Try it
              </ExternalLink>
            )}
          </figcaption>
        </figure>
      )}

      <CaseSection id="architecture" title="Architecture" content={caseStudy.architecture}>
        {(diagram) => (
          <>
            <ArchitectureDiagram diagram={diagram} id={`${slug}-diagram`} title={project.name} />
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-2">
              {diagram.description}
            </p>
          </>
        )}
      </CaseSection>

      {project.tables && project.tables.length > 0 && (
        <CaseSection id="results" title="Results" content={project.tables}>
          {(tables) => (
            <div className="space-y-12">
              {tables.map((table, i) => (
                <DataTable key={table.caption} table={table} id={`${slug}-table-${i}`} />
              ))}
            </div>
          )}
        </CaseSection>
      )}

      <CaseSection id="decisions" title="Key decisions and tradeoffs" content={caseStudy.decisions}>
        {(decisions) => (
          <ol className="grid max-w-3xl gap-8">
            {decisions.map((decision) => (
              <li key={decision.title}>
                <h3 className="font-serif text-2xl font-medium tracking-tight">{decision.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-2">{decision.body}</p>
              </li>
            ))}
          </ol>
        )}
      </CaseSection>

      <CaseSection id="broke" title="What broke and how I fixed it" content={caseStudy.broke}>
        {(incidents) => (
          <ol className="grid max-w-3xl gap-10">
            {incidents.map((incident) => (
              <li key={incident.title}>
                <h3 className="font-serif text-2xl font-medium tracking-tight">{incident.title}</h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-[5rem_1fr]">
                  <dt className="text-xs font-medium tracking-[0.14em] text-ink-3 uppercase sm:pt-1">
                    Symptom
                  </dt>
                  <dd className="leading-relaxed text-ink-2">{incident.symptom}</dd>
                  <dt className="text-xs font-medium tracking-[0.14em] text-accent uppercase sm:pt-1">
                    Fix
                  </dt>
                  <dd className="leading-relaxed">{incident.fix}</dd>
                </dl>
              </li>
            ))}
          </ol>
        )}
      </CaseSection>

      <CaseSection id="next" title="What I'd do next" content={caseStudy.next}>
        {(steps) => (
          <ul className="max-w-2xl list-disc space-y-2 pl-5 text-lg leading-relaxed marker:text-ink-3">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        )}
      </CaseSection>

      {caseStudy.readMore && (
        <CaseSection id="read-more" title="Go deeper" content={caseStudy.readMore}>
          {(links) => (
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <ExternalLink
                    href={link.href}
                    className="text-lg underline decoration-rule underline-offset-4 hover:text-accent hover:decoration-accent"
                  >
                    {link.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          )}
        </CaseSection>
      )}

      {nextProject && nextProject.slug !== slug && (
        <nav aria-label="Next project" className="mt-8 border-t border-ink pt-8">
          <Link href={`/projects/${nextProject.slug}`} className="group block">
            <span className="text-xs font-medium tracking-[0.14em] text-ink-3 uppercase">
              Next case study
            </span>
            <span className="mt-2 flex items-center gap-3 font-serif text-4xl font-medium tracking-tight transition-colors group-hover:text-accent">
              {nextProject.name}
              <ArrowRight className="size-6 transition-transform motion-safe:group-hover:translate-x-1" />
            </span>
          </Link>
        </nav>
      )}
    </article>
  )
}
