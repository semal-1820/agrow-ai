import PageHeader from '../../../components/ui/PageHeader'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { highRiskEnterprises } from '../../../data/officer'
import { HiOutlineExclamationTriangle } from 'react-icons/hi2'

const officerAlerts = [
  { id: 1, title: 'Mai Kali Poultry — Risk score crossed threshold', severity: 'high', date: '2026-07-15' },
  { id: 2, title: '3 enterprises in Sundarpur missed EMI this month', severity: 'high', date: '2026-07-14' },
  { id: 3, title: 'Weather advisory: heavy rainfall in Sehore district', severity: 'medium', date: '2026-07-12' },
  { id: 4, title: 'Rampur village enterprise count crossed 250', severity: 'low', date: '2026-07-08' },
]

export default function OfficerAlerts() {
  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/officer/dashboard' }, { label: 'Alerts' }]}
        title="AI Alerts"
        description="System-generated alerts across your enterprise portfolio."
      />
      <div className="space-y-3">
        {officerAlerts.map((a) => (
          <Card key={a.id} className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <HiOutlineExclamationTriangle size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm">{a.title}</h3>
                <Badge tone={a.severity}>{a.severity}</Badge>
              </div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim mt-2">{a.date}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
