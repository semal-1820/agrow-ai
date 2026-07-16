import { Outlet } from 'react-router-dom'
import Sidebar from '../components/navigation/Sidebar'
import Navbar from '../components/navigation/Navbar'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export default function AppLayout({ nav }) {
  const online = useOnlineStatus()

  return (
    <div className="flex min-h-screen bg-surface dark:bg-surface-dark">
      <Sidebar items={nav} offline={!online} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />
        <main className="flex-1 p-4 lg:p-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
