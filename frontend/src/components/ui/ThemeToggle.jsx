import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2'
import { useTheme } from '../../context/ThemeContext'

// Standalone light/dark toggle for pages outside the authenticated app shell
// (Landing, Login, Register) which don't have the Navbar's built-in toggle.
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle brightness"
      className={`w-9 h-9 rounded-lg flex items-center justify-center border border-border dark:border-border-dark text-ink-dim dark:text-ink-dark-dim hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${className}`}
    >
      {theme === 'dark' ? <HiOutlineSun size={18} /> : <HiOutlineMoon size={18} />}
    </button>
  )
}
