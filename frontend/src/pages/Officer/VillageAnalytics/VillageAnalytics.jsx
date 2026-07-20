import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

import PageHeader from '../../../components/ui/PageHeader'
import StatCard from '../../../components/ui/StatCard'
import Card from '../../../components/ui/Card'
import {
  Table,
  Thead,
  Th,
  Tr,
  Td,
} from '../../../components/ui/Table'

import {
  HiOutlineMapPin,
  HiOutlineBuildingOffice2,
  HiOutlineBanknotes,
  HiOutlineSquares2X2,
} from 'react-icons/hi2'

import {
  getVillageAnalytics,
  getSectorDistribution,
} from '../../../services/officerService'
import { PageSkeleton } from '../../../components/ui/Skeleton'

const COLORS = [
  '#2E7D32',
  '#4CAF50',
  '#FFC107',
  '#2563EB',
  '#94A3B8',
]

export default function VillageAnalytics() {
  const [villageData, setVillageData] = useState([])
  const [sectorDistribution, setSectorDistribution] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        setError('')

        const [
          villageResponse,
          sectorResponse,
        ] = await Promise.all([
          getVillageAnalytics(),
          getSectorDistribution(),
        ])

        const villages = Array.isArray(villageResponse)
          ? villageResponse.map((village) => ({
              village: village.village || 'Unknown',
              district: village.district || 'Unknown',
              enterprises: village.totalEnterprises || 0,
              averageIncome: village.averageIncome || 0,
            }))
          : []

        const sectors = Array.isArray(sectorResponse)
          ? sectorResponse.map((sector) => ({
              name: sector.sector || 'Unknown',
              value: sector.count || 0,
            }))
          : []

        setVillageData(villages)
        setSectorDistribution(sectors)
      } catch (err) {
        console.error(
          'Village analytics loading error:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load village analytics.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (loading) {
    return <PageSkeleton />
  }

  const totalEnterprises = villageData.reduce(
    (sum, village) =>
      sum + village.enterprises,
    0
  )

  const totalAverageIncome = villageData.reduce(
    (sum, village) =>
      sum + village.averageIncome,
    0
  )

  const averageIncome =
    villageData.length > 0
      ? totalAverageIncome / villageData.length
      : 0

  const totalSectors =
    sectorDistribution.length

  return (
    <div>
      <PageHeader
        breadcrumb={[
          {
            label: 'Dashboard',
            href: '/officer/dashboard',
          },
          {
            label: 'Village Analytics',
          },
        ]}
        title="Village Analytics"
        description="Enterprise distribution and income insights by village."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Villages Covered"
          value={villageData.length}
          icon={HiOutlineMapPin}
        />

        <StatCard
          label="Total Enterprises"
          value={totalEnterprises.toLocaleString(
            'en-IN'
          )}
          icon={HiOutlineBuildingOffice2}
        />

        <StatCard
          label="Avg. Annual Income"
          value={`₹${Math.round(
            averageIncome
          ).toLocaleString('en-IN')}`}
          icon={HiOutlineBanknotes}
        />

        <StatCard
          label="Sectors"
          value={totalSectors}
          icon={HiOutlineSquares2X2}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">
            Enterprises by Village
          </h3>

          {villageData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={220}
            >
              <BarChart data={villageData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E6EBF0"
                />

                <XAxis
                  dataKey="village"
                  tick={{
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />

                <Tooltip />

                <Bar
                  dataKey="enterprises"
                  fill="#2E7D32"
                  radius={[4, 4, 0, 0]}
                  name="Enterprises"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No village data available.
            </p>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">
            Sector Distribution
          </h3>

          {sectorDistribution.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={200}
            >
              <PieChart>
                <Pie
                  data={sectorDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {sectorDistribution.map(
                    (_, index) => (
                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No sector data available.
            </p>
          )}
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <h3 className="font-semibold">
            Village Breakdown
          </h3>
        </div>

        {villageData.length > 0 ? (
          <Table>
            <Thead>
              <Th>Village</Th>
              <Th>District</Th>
              <Th>Enterprises</Th>
              <Th>Average Annual Income</Th>
            </Thead>

            <tbody>
              {villageData.map(
                (village, index) => (
                  <Tr
                    key={`${village.village}-${village.district}-${index}`}
                  >
                    <Td className="font-medium">
                      {village.village}
                    </Td>

                    <Td>
                      {village.district}
                    </Td>

                    <Td>
                      {village.enterprises}
                    </Td>

                    <Td>
                      ₹
                      {Number(
                        village.averageIncome
                      ).toLocaleString(
                        'en-IN'
                      )}
                    </Td>
                  </Tr>
                )
              )}
            </tbody>
          </Table>
        ) : (
          <p className="text-sm text-center text-ink-dim dark:text-ink-dark-dim py-8">
            No village analytics available.
          </p>
        )}
      </Card>
    </div>
  )
}