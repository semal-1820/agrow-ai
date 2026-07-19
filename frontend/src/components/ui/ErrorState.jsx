import { HiOutlineExclamationTriangle } from 'react-icons/hi2'
import Button from './Button'

/**
 * Phase 4 — Error state (Module 12).
 * Matches EmptyState's visual language, but for "a request failed" rather
 * than "there's nothing here yet". Use this in the catch branch of a
 * data-fetching page instead of a raw error string or a blank screen.
 */
export default function ErrorState({
  title = 'Something went wrong',
  description = "We couldn't load this data. Please try again.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-risk-critical/10 flex items-center justify-center text-risk-critical mb-4">
        <HiOutlineExclamationTriangle size={26} />
      </div>
      <h3 className="font-semibold text-ink dark:text-ink-dark">{title}</h3>
      <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-1 max-w-sm">
        {description}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
