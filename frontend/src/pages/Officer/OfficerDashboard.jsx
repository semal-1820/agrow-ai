import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { officerSummary, sectorDistribution, highRiskEnterprises } from '../../data/officer'
import { HiOutlineBuildingOffice2, HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineFire } from 'react-icons/hi2'
import { Table, Thead, Th, Tr, Td } from '../../components/ui/Table'

const COLORS = ['#2E7D32', '#4CAF50', '#FFC107', '#2563EB', '#94A3B8']
const riskTrend = [
  { month: 'Feb', score: 118 }, { month: 'Mar', score: 124 }, { month: 'Apr', score: 131 },
  { month: 'May', score: 128 }, { month: 'Jun', score: 137 }, { month: 'Jul', score: 142 },
]

export default function OfficerDashboard() {
  const { user } = useAuth()
  return (
    <div>
      <PageHeader title={`Welcome, ${user?.name || 'Officer Singh'}`} description="Portfolio overview across your assigned villages." />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Enterprises" value={officerSummary.totalEnterprises.toLocaleString('en-IN')} icon={HiOutlineBuildingOffice2} />
        <StatCard label="Healthy" value={officerSummary.healthy} icon={HiOutlineCheckCircle} />
        <StatCard label="Medium Risk" value={officerSummary.mediumRisk} icon={HiOutlineExclamationTriangle} />
        <StatCard label="High Risk" value={officerSummary.highRisk} icon={HiOutlineFire} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">High-Risk Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={riskTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBF0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip />
              <Line dataKey="score" stroke="#D92D20" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="font-semibold mb-4">Sector Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sectorDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {sectorDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0 flex items-center justify-between">
          <h3 className="font-semibold">High-Risk Enterprises Needing Review</h3>
        </div>
        <div className="p-5 pt-4">
          <Table>
            <Thead><Th>Enterprise</Th><Th>Village</Th><Th>Risk Score</Th><Th></Th></Thead>
            <tbody>
              {highRiskEnterprises.map((e) => (
                <Tr key={e.id}>
                  <Td>{e.name}</Td><Td>{e.village}</Td>
                  <Td><Badge tone="high">{e.riskScore}</Badge></Td>
                  <Td><button className="text-primary-600 dark:text-primary-300 text-sm font-semibold">{e.action}</button></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
