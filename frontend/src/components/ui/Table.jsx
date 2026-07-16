import clsx from 'clsx'

export function Table({ children, className }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border dark:border-border-dark">
      <table className={clsx('w-full text-sm', className)}>{children}</table>
    </div>
  )
}

export function Thead({ children }) {
  return (
    <thead className="bg-slate-50 dark:bg-white/5 text-left text-xs uppercase tracking-wide text-ink-dim dark:text-ink-dark-dim">
      <tr>{children}</tr>
    </thead>
  )
}

export function Th({ children, className }) {
  return <th className={clsx('px-4 py-3 font-semibold', className)}>{children}</th>
}

export function Td({ children, className }) {
  return <td className={clsx('px-4 py-3 border-t border-border dark:border-border-dark', className)}>{children}</td>
}

export function Tr({ children, className }) {
  return <tr className={clsx('hover:bg-slate-50 dark:hover:bg-white/5 transition-colors', className)}>{children}</tr>
}
