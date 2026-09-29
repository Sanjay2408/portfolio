import { profile } from '@/content/profile'
import { isTodo } from '@/content/types'
import { cn } from '@/lib/cn'
import { ExternalLink } from '../external-link'
import { TodoNote } from '../todo-note'

const BUTTON =
  'inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors'
const PRIMARY = 'bg-accent text-on-accent hover:bg-ink hover:text-paper'
const SECONDARY = 'border border-ink/20 text-ink hover:border-ink'

/** Above the fold: name, one line, three actions. Nothing else. */
export function Hero() {
  const hasResume = !isTodo(profile.resume)
  return (
    <section
      aria-labelledby="hero-title"
      className="flex min-h-[min(calc(78svh-5rem),44rem)] flex-col justify-center py-16"
    >
      <h1
        id="hero-title"
        className="font-serif text-[clamp(3.5rem,12vw,8.5rem)] leading-[0.92] font-medium tracking-[-0.03em]"
      >
        {profile.name}
      </h1>
      <p className="mt-8 max-w-2xl text-xl leading-snug text-ink-2 sm:text-2xl">
        {profile.headline}
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        {isTodo(profile.resume) ? (
          <TodoNote todo={profile.resume} inline />
        ) : (
          <a href={profile.resume} className={cn(BUTTON, PRIMARY)}>
            Resume <span className="text-xs opacity-75">PDF</span>
          </a>
        )}
        <ExternalLink
          href={profile.links.github}
          className={cn(BUTTON, hasResume ? SECONDARY : PRIMARY)}
        >
          GitHub
        </ExternalLink>
        <a href={`mailto:${profile.email}`} className={cn(BUTTON, SECONDARY)}>
          Email
        </a>
      </div>
    </section>
  )
}
