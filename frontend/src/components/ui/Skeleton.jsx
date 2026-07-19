import clsx from 'clsx'

/**
 * Phase 4 — Skeleton loader (Module 12).
 * A generic shimmering placeholder block. Compose it into
 * page/card-shaped loading states instead of a spinner, so the layout
 * doesn't jump once real content arrives.
 */
export default function Skeleton({ className }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-lg bg-primary-50 dark:bg-white/5',
        className
      )}
    />
  )
}

/** A ready-made skeleton for a stat/metric card grid. */
export function StatCardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border dark:border-border-dark p-5 space-y-3"
        >
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

/** A ready-made skeleton for a table's rows. */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Full-page fallback used by React.lazy/Suspense while a route chunk loads. */
export function PageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-56" />
      <StatCardSkeleton />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
