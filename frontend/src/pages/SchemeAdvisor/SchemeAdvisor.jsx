import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { schemes } from '../../data/schemes'
import { HiOutlineGift } from 'react-icons/hi2'

export default function SchemeAdvisor() {
  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Scheme Advisor' }]}
        title="Government Scheme Advisor"
        description="Schemes matched to your business profile, financial history and sector."
      />

      <div className="grid md:grid-cols-2 gap-4">
        {schemes.map((s) => (
          <Card key={s.id} className="flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300">
                <HiOutlineGift size={20} />
              </div>
              <Badge tone={s.eligible ? 'low' : 'neutral'}>{s.eligible ? `${s.match}% Match` : 'Not Eligible'}</Badge>
            </div>
            <h3 className="font-semibold">{s.name}</h3>
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-1 flex-1">{s.description}</p>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-300 mt-3">{s.benefit}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {s.documents.map((d) => <Badge key={d} tone="neutral">{d}</Badge>)}
            </div>
            <Button variant={s.eligible ? 'primary' : 'outline'} size="sm" className="mt-4" disabled={!s.eligible}>
              {s.eligible ? 'View Details & Apply' : 'Not Eligible'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
