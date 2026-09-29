import type { Table } from '@/content/types'
import { cn } from '@/lib/cn'
import { ExternalLink } from './external-link'

/** Cells that hold a number (or n/a) are right-aligned so digits line up. */
const NUMERIC = /^(?:[₹\d.,%×\s]+|n\/a)$/

export function DataTable({ table, id }: { readonly table: Table; readonly id: string }) {
  const captionId = `${id}-caption`
  const numericColumn = table.columns.map(
    (_, i) => i > 0 && table.rows.every((row) => NUMERIC.test(row[i] ?? '')),
  )

  return (
    <figure className="min-w-0">
      {/* Focusable so keyboard users can scroll a wide table on small screens. */}
      <div
        role="region"
        aria-labelledby={captionId}
        tabIndex={0}
        className="overflow-x-auto border-y border-ink"
      >
        <table className="w-full min-w-[36rem] border-collapse text-sm tabular-nums">
          <caption id={captionId} className="sr-only">
            {table.caption}
          </caption>
          <thead>
            <tr className="border-b border-rule">
              {table.columns.map((column, i) => (
                <th
                  key={column}
                  scope="col"
                  className={cn(
                    'px-3 py-3 text-xs font-medium tracking-wide text-ink-3 uppercase first:pl-0 last:pr-0',
                    numericColumn[i] ? 'text-right' : 'text-left',
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row[0]} className="border-b border-rule last:border-0">
                {row.map((cell, i) => {
                  const key = `${row[0]}-${table.columns[i]}`
                  const align = numericColumn[i] ? 'text-right whitespace-nowrap' : 'text-left'
                  const tone = i === table.highlightColumn ? 'font-semibold text-ink' : 'text-ink-2'
                  return i === 0 ? (
                    <th
                      key={key}
                      scope="row"
                      className="px-3 py-3 pl-0 text-left align-top font-medium text-ink"
                    >
                      {cell}
                    </th>
                  ) : (
                    <td key={key} className={cn('px-3 py-3 align-top last:pr-0', align, tone)}>
                      {cell}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-2">
        <span className="font-medium text-ink">{table.caption}.</span>
        {table.note && ` ${table.note}`}{' '}
        <ExternalLink
          href={table.source}
          className="text-ink-3 underline decoration-rule underline-offset-2 hover:text-accent hover:decoration-accent"
        >
          Source
        </ExternalLink>
      </figcaption>
    </figure>
  )
}
