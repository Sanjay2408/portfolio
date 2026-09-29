'use client'

import { useSyncExternalStore } from 'react'
import { cn } from '@/lib/cn'
import type { StatusTone } from '@/lib/status-client'
import { describeStatus, statusStore } from '@/lib/status-client'

const TONE: Record<StatusTone, string> = {
  up: 'bg-up',
  down: 'bg-down',
  timeout: 'bg-timeout',
  unknown: 'bg-ink-3/40 motion-safe:animate-pulse',
}

/** Live status of a project URL. Fixed height, so its text changing never shifts the layout. */
export function StatusDot({ slug }: { readonly slug: string }) {
  const snapshot = useSyncExternalStore(
    statusStore.subscribe,
    statusStore.getSnapshot,
    statusStore.getServerSnapshot,
  )
  const view = describeStatus(snapshot, slug)

  return (
    <span className="inline-flex h-5 items-center gap-1.5 text-xs whitespace-nowrap text-ink-3 tabular-nums">
      <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', TONE[view.tone])} />
      <span aria-hidden="true">{view.text}</span>
      <span className="sr-only">{view.label}</span>
    </span>
  )
}
