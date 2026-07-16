import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import PageHeader from '../../../components/ui/PageHeader'
import StatCard from '../../../components/ui/StatCard'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { Table, Thead, Th, Tr, Td } from '../../../components/ui/Table'
import { villageData, sectorDistribution } from '../../../data/officer'
import { HiOutlineMapPin, HiOutlineBuildingOffice2, HiOutlineBanknotes, HiOutlineArrowTrendingUp } from 'react-icons/hi2'

const COLORS = ['#2E7D32', '#4CAF50', '#FFC107', '#2563EB', '#94A3B8']
const riskTone = { Low: 'low', Medium: 'medium', High: 'high' }

export default function VillageAnalytics() {
  const totalEnterprises = villageData.reduce((s, v) => s + v.enterprises, 0)
  const avgGrowth = (villageData.reduce((s, v) => s + v.growth, 0) / villageData.length).toFixed(1)

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/officer/dashboard' }, { label: 'Village Analytics' }]}
        title="Village Analytics"
        description="Enterprise density, turnover and growth trends by village."
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Villages Covered" value={villageData.length} icon={HiOutlineMapPin} />
        <StatCard label="Total Enterprises" value={totalEnterprises.toLocaleString('en-IN')} icon={HiOutlineBuildingOffice2} />
        <StatCard label="Avg. Turnover" value="₹18.6 Lakh" icon={HiOutlineBanknotes} />
        <StatCard label="Avg. Growth" value={`${avgGrowth}%`} icon={HiOutlineArrowTrendingUp} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Enterprises by Village</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={villageData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBF0" />
              <XAxis dataKey="village" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip />
              <Bar dataKey="enterprises" fill="#2E7D32" radius={[4, 4, 0, 0]} />
            </BarChart>
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
        <div className="p-5 pb-0"><h3 className="font-semibold">Village Breakdown</h3></div>
        <Table>
          <Thead><Th>Village</Th><Th>Enterprises</Th><Th>Avg Turnover</Th><Th>Growth</Th><Th>Risk Level</Th></Thead>
          <tbody>
            {villageData.map((v) => (
              <Tr key={v.village}>
                <Td className="font-medium">{v.village}</Td><Td>{v.enterprises}</Td>
                <Td>₹{v.avgTurnover.toLocaleString('en-IN')}</Td>
                <Td className={v.growth >= 0 ? 'text-primary-600 dark:text-primary-300 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                  {v.growth >= 0 ? '+' : ''}{v.growth}%
                </Td>
                <Td><Badge tone={riskTone[v.riskLevel]}>{v.riskLevel}</Badge></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}
