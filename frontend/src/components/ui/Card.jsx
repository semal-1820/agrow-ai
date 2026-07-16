import clsx from 'clsx'

export default function Card({ children, className, padded = true, ...props }) {
  return (
    <div
      className={clsx(
        'bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-card shadow-soft dark:shadow-soft-dark',
        padded && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
