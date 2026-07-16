import PageHeader from '../../../components/ui/PageHeader'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2'

const reportTypes = [
  { name: 'Portfolio Risk Summary', desc: 'Risk distribution across all assigned enterprises' },
  { name: 'Village Performance Report', desc: 'Turnover and growth by village' },
  { name: 'Default Prediction Report', desc: 'Enterprises flagged for review this month' },
]

export default function OfficerReports() {
  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/officer/dashboard' }, { label: 'Reports' }]}
        title="Reports"
        description="Generate portfolio and village-level reports."
      />
      <div className="grid md:grid-cols-3 gap-4">
        {reportTypes.map((r) => (
          <Card key={r.name} className="flex flex-col">
            <h3 className="font-semibold mb-1">{r.name}</h3>
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim flex-1">{r.desc}</p>
            <Button size="sm" icon={HiOutlineDocumentArrowDown} className="mt-4">Generate PDF</Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
