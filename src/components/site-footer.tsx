import { profile } from '@/content/profile'
import { isTodo } from '@/content/types'
import { ExternalLink } from './external-link'
import { TodoNote } from './todo-note'

const LINK =
  'underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent'

export function SiteFooter() {
  return (
    <footer
      id="contact"
      aria-labelledby="contact-title"
      className="mx-auto w-full max-w-6xl scroll-mt-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="border-t border-ink py-16 sm:py-20">
        <h2
          id="contact-title"
          className="font-serif text-4xl font-medium tracking-tight sm:text-5xl"
        >
          Get in touch
        </h2>
        <p className="mt-4 max-w-xl text-lg text-ink-2">
          I am looking for SDE internships. The fastest way to reach me is email.
        </p>
        <a
          href={`mailto:${profile.email}`}
          className="mt-8 inline-block font-serif text-2xl break-all text-accent underline decoration-accent/40 underline-offset-[6px] transition-colors hover:decoration-accent sm:text-3xl"
        >
          {profile.email}
        </a>
        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <li>
            <ExternalLink href={profile.links.github} className={LINK}>
              GitHub
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={profile.links.linkedin} className={LINK}>
              LinkedIn
            </ExternalLink>
          </li>
          <li>
            {isTodo(profile.resume) ? (
              <TodoNote todo={profile.resume} inline />
            ) : (
              <a href={profile.resume} className={LINK}>
                Resume (PDF)
              </a>
            )}
          </li>
        </ul>
      </div>
      <p className="border-t border-rule py-6 text-xs text-ink-3">
        Built with Next.js + TypeScript.{' '}
        <ExternalLink href={profile.links.source} className={LINK}>
          Source on GitHub
        </ExternalLink>
      </p>
    </footer>
  )
}
