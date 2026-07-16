import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import { businessHealth } from '../../data/health'
import { HiOutlineLightBulb } from 'react-icons/hi2'

export default function EnterpriseHealth() {
  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Enterprise Health' }]}
        title="Enterprise Health"
        description="A composite score of how sustainably your business is running."
      />

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="flex flex-col items-center justify-center text-center">
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim mb-2">Health Score</p>
          <div className="w-28 h-28 rounded-full border-8 border-primary-500 flex items-center justify-center">
            <span className="text-3xl font-bold">{businessHealth.score}</span>
          </div>
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-300 mt-3">{businessHealth.label}</p>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Score Breakdown</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {businessHealth.breakdown.map((b) => (
              <div key={b.name} className="flex items-center justify-between text-sm border border-border dark:border-border-dark rounded-lg px-3 py-2">
                <span>{b.name}</span>
                <span className="font-semibold">{b.score}/100</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Health Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={businessHealth.trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBF0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={30} domain={[0, 100]} />
              <Tooltip />
              <Line dataKey="score" stroke="#2E7D32" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineLightBulb className="text-accent" size={20} />
            <h3 className="font-semibold">Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {businessHealth.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-ink-dim dark:text-ink-dark-dim border-l-2 border-primary-500 pl-3">{r}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
