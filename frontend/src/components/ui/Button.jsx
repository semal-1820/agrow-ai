import { motion } from 'framer-motion'
import clsx from 'clsx'

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-soft',
  outline: 'border border-border dark:border-border-dark text-ink dark:text-ink-dark hover:bg-primary-50 dark:hover:bg-white/5',
  ghost: 'text-ink-dim dark:text-ink-dark-dim hover:bg-primary-50 dark:hover:bg-white/5',
  danger: 'bg-risk-critical text-white hover:brightness-95',
}

const sizes = {
  sm: 'text-sm px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 rounded-xl',
  lg: 'text-base px-5 py-3 rounded-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="text-base" />}
      {children}
    </motion.button>
  )
}
