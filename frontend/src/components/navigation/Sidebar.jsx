import { NavLink, useNavigate } from 'react-router-dom'
import { HiOutlineArrowLeftOnRectangle } from 'react-icons/hi2'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

export default function Sidebar({ items, offline }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-primary-700 text-white">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center font-bold">A</div>
        <div>
          <p className="font-bold leading-tight">Agrow AI</p>
          <p className="text-[10px] text-white/60 leading-tight">Rural Financial Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-white text-primary-700' : 'text-white/80 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-2">
        {offline && (
          <div className="text-[11px] px-3 py-1.5 rounded-lg bg-amber-400/20 text-amber-200 font-medium">
            Offline — changes will sync
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <HiOutlineArrowLeftOnRectangle size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
