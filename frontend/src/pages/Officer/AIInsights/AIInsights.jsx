import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import PageHeader from '../../../components/ui/PageHeader'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { highRiskEnterprises, sectorDistribution } from '../../../data/officer'
import { HiOutlineSparkles, HiOutlineExclamationTriangle, HiOutlineArrowTrendingUp, HiOutlineLightBulb } from 'react-icons/hi2'

const predictedTrends = [
  { month: 'Aug', highRisk: 148 }, { month: 'Sep', highRisk: 154 }, { month: 'Oct', highRisk: 146 },
  { month: 'Nov', highRisk: 139 }, { month: 'Dec', highRisk: 132 }, { month: 'Jan', highRisk: 128 },
]

const interventions = [
  { title: 'Feed-cost subsidy outreach', target: '38 dairy enterprises in Sundarpur & Khajuria', impact: 'High', reason: 'Feed cost volatility is the top driver of rising risk scores in these villages.' },
  { title: 'EMI restructuring review', target: '17 enterprises with 2+ upcoming EMIs in 30 days', impact: 'High', reason: 'Clustered EMI due dates are the leading cause of short-term liquidity stress.' },
  { title: 'Monsoon buffer advisory', target: 'All dairy & crop enterprises district-wide', impact: 'Medium', reason: 'Seasonal cash flow dip is predictable and preventable with early advisory.' },
]

export default function AIInsights() {
  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/officer/dashboard' }, { label: 'AI Insights Center' }]}
        title="AI Insights Center"
        description="Model-driven risk trends, forecasts and suggested interventions across your portfolio."
      />

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineArrowTrendingUp className="text-primary-600 dark:text-primary-300" size={18} />
            <h3 className="font-semibold">Predicted High-Risk Trend (6 Months)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={predictedTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBF0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip />
              <Line dataKey="highRisk" stroke="#D92D20" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim mt-2">
            High-risk enterprise count is projected to decline gradually if current intervention recommendations are followed.
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineExclamationTriangle className="text-red-500" size={18} />
            <h3 className="font-semibold">Top Risks Right Now</h3>
          </div>
          <ul className="space-y-3">
            {highRiskEnterprises.map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span>{e.name}</span>
                <Badge tone="high">{e.riskScore}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineSparkles className="text-accent" size={18} />
          <h3 className="font-semibold">Suggested Interventions</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {interventions.map((i) => (
            <div key={i.title} className="border border-border dark:border-border-dark rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{i.title}</h4>
                <Badge tone={i.impact === 'High' ? 'high' : 'medium'}>{i.impact} impact</Badge>
              </div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim mb-2">{i.target}</p>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim border-t border-border dark:border-border-dark pt-2">{i.reason}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          <HiOutlineLightBulb className="text-accent" size={18} />
          <h3 className="font-semibold">Forecast Summary</h3>
        </div>
        <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
          Portfolio-wide cash flow is expected to dip 8-12% across dairy and poultry enterprises heading into monsoon,
          consistent with prior-year seasonal patterns. Sectors most exposed: {sectorDistribution[0].name} and {sectorDistribution[2].name}.
          Recommend prioritizing the feed-cost subsidy outreach intervention above before early August.
        </p>
      </Card>
    </div>
  )
}
