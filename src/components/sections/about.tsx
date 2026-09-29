import { profile } from '@/content/profile'

export function About() {
  return (
    <section aria-label="About me" className="border-t border-rule py-10">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
        {profile.facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-xs font-medium tracking-[0.14em] text-ink-3 uppercase">
              {fact.label}
            </dt>
            <dd className="mt-2 leading-snug">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
