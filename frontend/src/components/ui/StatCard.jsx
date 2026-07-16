import Card from './Card'
import clsx from 'clsx'

export default function StatCard({ label, value, change, changeTone = 'positive', icon: Icon }) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-dim dark:text-ink-dark-dim">{label}</span>
        {Icon && (
          <span className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300">
            <Icon size={16} />
          </span>
        )}
      </div>
      <span className="text-2xl font-bold tracking-tight">{value}</span>
      {change && (
        <span
          className={clsx(
            'text-xs font-semibold',
            changeTone === 'positive' && 'text-primary-600 dark:text-primary-300',
            changeTone === 'negative' && 'text-red-600 dark:text-red-400'
          )}
        >
          {change}
        </span>
      )}
    </Card>
  )
}
