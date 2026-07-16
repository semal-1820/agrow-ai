import { HiOutlineBanknotes, HiOutlineArrowTrendingDown, HiOutlineHeart } from 'react-icons/hi2'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { monthlyFinancials, currentBalance } from '../../data/financials'
import { riskOverview } from '../../data/risk'
import { businessHealth } from '../../data/health'
import { alerts } from '../../data/alerts'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.name || 'Ramesh Kumar'}`}
        description="Here's your business overview."
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Current Balance" value={`₹${currentBalance.toLocaleString('en-IN')}`} change="+12.5% from last month" icon={HiOutlineBanknotes} />
        <StatCard label="Monthly Expenses" value="₹45,320" change="-3.4% from last month" changeTone="negative" icon={HiOutlineArrowTrendingDown} />
        <StatCard label="Business Health" value="85/100" change="Good" icon={HiOutlineHeart} />
        <Card className="flex flex-col justify-between">
          <span className="text-xs font-medium text-ink-dim dark:text-ink-dark-dim">Risk Level</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-bold">{riskOverview.score}/100</span>
            <Badge tone="medium">Medium Risk</Badge>
          </div>
          <Link to="/app/risk-intelligence" className="text-xs font-semibold text-primary-600 dark:text-primary-300 mt-2">View Details</Link>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Cash Flow (Last 6 Months)</h3>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">Income vs net cash flow</p>
            </div>
            <Link to="/app/forecast-studio" className="text-xs font-semibold text-primary-600 dark:text-primary-300">View Details</Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyFinancials}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBF0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip />
              <Area type="monotone" dataKey="income" stroke="#2E7D32" fill="url(#income)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="net" stroke="#2563EB" fill="transparent" strokeWidth={2} name="Net Cash Flow" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-semibold mb-1">AI Insight</h3>
          <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
            Your cash flow is expected to dip 10% next month due to rising feed costs ahead of monsoon. Consider the Kisan Credit Card scheme for working capital buffer.
          </p>
          <Link to="/app/scheme-advisor"><Button variant="outline" size="sm" className="mt-4 w-full">View Schemes</Button></Link>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Upcoming EMI</h3>
            <Badge tone="high">₹15,220 due</Badge>
          </div>
          <p className="text-sm text-ink-dim dark:text-ink-dark-dim">LN-1042 · Due on 5 Aug 2026</p>
          <Button size="sm" className="mt-4">Pay Now</Button>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Alerts</h3>
            <Link to="/app/notifications" className="text-xs font-semibold text-primary-600 dark:text-primary-300">View All</Link>
          </div>
          <ul className="space-y-2">
            {alerts.slice(0, 2).map((a) => (
              <li key={a.id} className="text-sm flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <span>{a.title}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
