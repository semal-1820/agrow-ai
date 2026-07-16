import { HiOutlineInboxStack } from 'react-icons/hi2'

export default function EmptyState({ icon: Icon = HiOutlineInboxStack, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 mb-4">
        <Icon size={26} />
      </div>
      <h3 className="font-semibold text-ink dark:text-ink-dark">{title}</h3>
      {description && <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
