import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import PageHeader from '../../../components/ui/PageHeader'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { Table, Thead, Th, Tr, Td } from '../../../components/ui/Table'
import { officerSummary, highRiskEnterprises } from '../../../data/officer'

const riskTrend = [
  { month: 'Feb', high: 118, medium: 320 }, { month: 'Mar', high: 124, medium: 335 },
  { month: 'Apr', high: 131, medium: 342 }, { month: 'May', high: 128, medium: 349 },
  { month: 'Jun', high: 137, medium: 352 }, { month: 'Jul', high: 142, medium: 356 },
]

export default function RiskMonitoring() {
  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/officer/dashboard' }, { label: 'Risk Monitoring' }]}
        title="Risk Monitoring"
        description="Portfolio-wide risk distribution and default prediction."
      />

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="flex flex-col items-center justify-center text-center">
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim mb-2">Risk Overview</p>
          <ResponsiveContainer width={160} height={160}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: 68, fill: '#EF6C1C' }]} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={20} background />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-2xl font-bold -mt-16">{officerSummary.highRisk}<span className="text-sm text-ink-dim dark:text-ink-dark-dim">/{officerSummary.totalEnterprises}</span></p>
          <Badge tone="high" className="mt-16">High Risk</Badge>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Risk Trend Across Portfolio</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={riskTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBF0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip />
              <Line dataKey="high" stroke="#D92D20" strokeWidth={2.5} dot={{ r: 3 }} name="High Risk" />
              <Line dataKey="medium" stroke="#FFC107" strokeWidth={2.5} dot={{ r: 3 }} name="Medium Risk" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0 flex items-center justify-between">
          <h3 className="font-semibold">Default Prediction — Priority Review List</h3>
        </div>
        <Table>
          <Thead><Th>Enterprise</Th><Th>Village</Th><Th>Risk Score</Th><Th>Recommended Action</Th></Thead>
          <tbody>
            {highRiskEnterprises.map((e) => (
              <Tr key={e.id}>
                <Td className="font-medium">{e.name}</Td><Td>{e.village}</Td>
                <Td><Badge tone="high">{e.riskScore}</Badge></Td>
                <Td><button className="text-primary-600 dark:text-primary-300 text-sm font-semibold">{e.action}</button></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}
