import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Toggle from '../../components/ui/Toggle'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [offlineSync, setOfflineSync] = useState(true)

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: user?.role === 'officer' ? '/officer/dashboard' : '/app/dashboard' }, { label: 'Settings' }]}
        title="Settings"
        description="App preferences and account settings."
      />

      <div className="grid gap-4 max-w-2xl">
        <Card>
          <h3 className="font-semibold mb-4">Appearance</h3>
          <div className="flex items-center gap-2">
            {['light', 'dark'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold capitalize transition-colors ${
                  theme === t ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'border-border dark:border-border-dark'
                }`}
              >
                {t} mode
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold">Notifications</h3>
          <Toggle checked={emailAlerts} onChange={setEmailAlerts} label="Email alerts" />
          <Toggle checked={smsAlerts} onChange={setSmsAlerts} label="SMS alerts (prototype)" />
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold">Data & Sync</h3>
          <Toggle checked={offlineSync} onChange={setOfflineSync} label="Sync data automatically when back online" />
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
            Entries made while offline are cached on this device and synced once a connection is available.
          </p>
        </Card>
      </div>
    </div>
  )
}
