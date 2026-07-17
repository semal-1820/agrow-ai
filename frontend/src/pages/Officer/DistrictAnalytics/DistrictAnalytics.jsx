import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'
import PageHeader from '../../../components/ui/PageHeader'
import StatCard from '../../../components/ui/StatCard'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { Table, Thead, Th, Tr, Td } from '../../../components/ui/Table'
import { districtData, loanDistribution } from '../../../data/districtAnalytics'
import { HiOutlineMapPin, HiOutlineBanknotes, HiOutlineArrowTrendingUp, HiOutlineBuildingLibrary } from 'react-icons/hi2'

const COLORS = ['#2E7D32', '#4CAF50', '#75C47D', '#FFC107', '#2563EB']
const riskTone = { Low: 'low', Medium: 'medium', High: 'high' }

export default function DistrictAnalytics() {
  const ranked = [...districtData].sort((a, b) => b.revenue - a.revenue)
  const totalEnterprises = districtData.reduce((s, d) => s + d.enterprises, 0)
  const avgHealth = Math.round(districtData.reduce((s, d) => s + d.healthAvg, 0) / districtData.length)

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/officer/dashboard' }, { label: 'District Analytics' }]}
        title="District Analytics"
        description="Enterprise growth, revenue and loan distribution ranked by district."
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Districts Covered" value={districtData.length} icon={HiOutlineMapPin} />
        <StatCard label="Total Enterprises" value={totalEnterprises.toLocaleString('en-IN')} icon={HiOutlineBuildingLibrary} />
        <StatCard label="Total Revenue Tracked" value="₹57.1 Cr" icon={HiOutlineBanknotes} />
        <StatCard label="Avg. Health Score" value={`${avgHealth}/100`} icon={HiOutlineArrowTrendingUp} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">District Ranking by Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ranked} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E6EBF0" />
              <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000000).toFixed(1)}Cr`} />
              <YAxis type="category" dataKey="district" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
              <Bar dataKey="revenue" fill="#2E7D32" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="font-semibold mb-4">Loan Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={loanDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {loanDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0"><h3 className="font-semibold">District Breakdown</h3></div>
        <Table>
          <Thead><Th>District</Th><Th>Enterprises</Th><Th>Revenue</Th><Th>Growth</Th><Th>Loans Disbursed</Th><Th>Avg Health</Th><Th>Risk</Th></Thead>
          <tbody>
            {ranked.map((d) => (
              <Tr key={d.district}>
                <Td className="font-medium">{d.district}</Td><Td>{d.enterprises.toLocaleString('en-IN')}</Td>
                <Td>₹{(d.revenue / 10000000).toFixed(2)} Cr</Td>
                <Td className={d.growth >= 0 ? 'text-primary-600 dark:text-primary-300 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                  {d.growth >= 0 ? '+' : ''}{d.growth}%
                </Td>
                <Td>{d.loansDisbursed}</Td><Td>{d.healthAvg}/100</Td>
                <Td><Badge tone={riskTone[d.riskLevel]}>{d.riskLevel}</Badge></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}
