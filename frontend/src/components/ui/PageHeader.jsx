import Breadcrumb from './Breadcrumb'

export default function PageHeader({ breadcrumb, title, description, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div>
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-1 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}
