import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { alerts } from '../../data/alerts'
import { HiOutlineBanknotes, HiOutlineCloud, HiOutlineArrowTrendingUp, HiOutlineShieldExclamation, HiOutlineBellSlash } from 'react-icons/hi2'

const iconFor = { emi: HiOutlineBanknotes, weather: HiOutlineCloud, market: HiOutlineArrowTrendingUp, risk: HiOutlineShieldExclamation }
const toneFor = { high: 'high', medium: 'medium', low: 'low' }

export default function Notifications() {
  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Notifications' }]}
        title="Notifications"
        description="Weather, market, EMI and risk alerts relevant to your business."
      />

      {alerts.length === 0 ? (
        <EmptyState icon={HiOutlineBellSlash} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const Icon = iconFor[a.type] || HiOutlineBellSlash
            return (
              <Card key={a.id} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300 shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm">{a.title}</h3>
                    <Badge tone={toneFor[a.severity]}>{a.severity}</Badge>
                  </div>
                  <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-1">{a.message}</p>
                  <p className="text-xs text-ink-dim dark:text-ink-dark-dim mt-2">{a.date}</p>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
