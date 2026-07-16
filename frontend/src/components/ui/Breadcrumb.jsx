import { Link } from 'react-router-dom'
import { HiChevronRight } from 'react-icons/hi2'

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-ink-dim dark:text-ink-dark-dim mb-1">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {item.href ? (
            <Link to={item.href} className="hover:text-primary-600 dark:hover:text-primary-300">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink dark:text-ink-dark font-medium">{item.label}</span>
          )}
          {i < items.length - 1 && <HiChevronRight size={14} />}
        </span>
      ))}
    </nav>
  )
}
