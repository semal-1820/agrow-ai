import clsx from 'clsx'

const tones = {
  low: 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  high: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-ink-dark-dim',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
}

export default function Badge({ children, tone = 'neutral', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
