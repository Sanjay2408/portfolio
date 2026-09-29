import { flagship } from '@/content/projects'
import { headlineSentence } from '@/content/risk-atlas'
import { DataTable } from '../data-table'
import { MetricList } from '../metric-list'
import { ProjectLinks } from '../project-links'
import { Eyebrow } from '../section'
import { StackChips } from '../stack-chips'

export function Flagship() {
  if (!flagship) return null
  return (
    <section
      id="flagship"
      aria-labelledby="flagship-title"
      className="scroll-mt-8 border-t border-ink py-20 sm:py-28"
    >
      <Eyebrow>
        Flagship
        {flagship.context && (
          <span className="tracking-normal normal-case"> · {flagship.context}</span>
        )}
      </Eyebrow>
      <h2
        id="flagship-title"
        className="mt-3 font-serif text-5xl font-medium tracking-tight sm:text-7xl"
      >
        {flagship.name}
      </h2>

      <p className="mt-8 max-w-4xl font-serif text-2xl leading-snug sm:text-3xl">
        {headlineSentence}
      </p>

      <MetricList metrics={flagship.metrics} size="lg" className="mt-12" />

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <div className="max-w-2xl space-y-4 text-lg leading-relaxed">
          <p className="text-ink-2">{flagship.problem}</p>
          <p>{flagship.built}</p>
        </div>
        <div className="space-y-6">
          <StackChips stack={flagship.stack} />
          <ProjectLinks project={flagship} />
        </div>
      </div>

      <div className="mt-16 space-y-14">
        {flagship.tables?.map((table, i) => (
          <DataTable key={table.caption} table={table} id={`flagship-table-${i}`} />
        ))}
      </div>
    </section>
  )
}
