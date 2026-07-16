import { HiOutlineMagnifyingGlass, HiOutlineSun, HiOutlineMoon, HiOutlineBell } from 'react-icons/hi2'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-6 bg-card/90 dark:bg-card-dark/90 backdrop-blur border-b border-border dark:border-border-dark">
      <div className="hidden sm:flex items-center gap-2 flex-1 max-w-sm bg-slate-100 dark:bg-white/5 rounded-lg px-3 py-2">
        <HiOutlineMagnifyingGlass className="text-ink-dim dark:text-ink-dark-dim" size={16} />
        <input
          placeholder="Search anything..."
          className="bg-transparent outline-none text-sm w-full placeholder:text-ink-dim dark:placeholder:text-ink-dark-dim"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-ink-dim dark:text-ink-dark-dim"
        >
          {theme === 'dark' ? <HiOutlineSun size={18} /> : <HiOutlineMoon size={18} />}
        </button>
        <Link
          to="notifications"
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-ink-dim dark:text-ink-dark-dim relative"
        >
          <HiOutlineBell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </Link>
        <div className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-semibold">
          {user?.name?.[0] || 'U'}
        </div>
      </div>
    </header>
  )
}
