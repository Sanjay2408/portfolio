import { design } from '@/content/profile'
import { ExternalLink } from '../external-link'
import { Section } from '../section'

export function Design() {
  return (
    <Section id="design" eyebrow="Also a designer" title={design.title} intro={design.pitch}>
      <ul className="max-w-3xl">
        {design.roles.map((role) => (
          <li
            key={role.org}
            className="grid gap-1 border-t border-rule py-5 sm:grid-cols-[14rem_1fr] sm:gap-8"
          >
            <span className="font-medium">{role.org}</span>
            <span className="text-ink-2">
              {role.role}
              {'detail' in role && role.detail ? `. ${role.detail}.` : ''}
            </span>
          </li>
        ))}
      </ul>
      <ExternalLink
        href={design.portfolio.href}
        className="mt-8 font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
      >
        {design.portfolio.label}
      </ExternalLink>
    </Section>
  )
}
