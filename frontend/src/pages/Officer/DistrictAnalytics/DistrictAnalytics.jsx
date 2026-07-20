import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

import PageHeader from '../../../components/ui/PageHeader'
import StatCard from '../../../components/ui/StatCard'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import {
  Table,
  Thead,
  Th,
  Tr,
  Td,
} from '../../../components/ui/Table'

import {
  HiOutlineMapPin,
  HiOutlineBanknotes,
  HiOutlineBuildingLibrary,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2'

import {
  getDistrictAnalytics,
  getRiskHeatmap,
} from '../../../services/officerService'
import { PageSkeleton } from '../../../components/ui/Skeleton'

const riskTone = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
}

export default function DistrictAnalytics() {
  const [districtData, setDistrictData] = useState([])
  const [riskData, setRiskData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        setError('')

        const [
          districtResponse,
          riskResponse,
        ] = await Promise.all([
          getDistrictAnalytics(),
          getRiskHeatmap(),
        ])

        setDistrictData(
          Array.isArray(districtResponse)
            ? districtResponse
            : []
        )

        setRiskData(
          Array.isArray(riskResponse)
            ? riskResponse
            : []
        )
      } catch (err) {
        console.error(
          'District analytics loading error:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load district analytics.'
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

  const combinedData = districtData.map(
    (district) => {
      const risk = riskData.find(
        (item) =>
          item.district === district.district
      )

      const averageRiskScore =
        risk?.averageRiskScore || 0

      let riskLevel = 'Low'

      if (averageRiskScore >= 70) {
        riskLevel = 'High'
      } else if (averageRiskScore >= 40) {
        riskLevel = 'Medium'
      }

      return {
        district:
          district.district || 'Unknown',

        totalEnterprises:
          district.totalEnterprises || 0,

        averageIncome:
          district.averageIncome || 0,

        averageRiskScore,

        highRiskEnterprises:
          risk?.highRiskEnterprises || 0,

        totalAssessments:
          risk?.totalAssessments || 0,

        riskLevel,
      }
    }
  )

  const ranked = [...combinedData].sort(
    (a, b) =>
      b.averageIncome -
      a.averageIncome
  )

  const totalEnterprises =
    combinedData.reduce(
      (sum, district) =>
        sum +
        district.totalEnterprises,
      0
    )

  const totalAverageIncome =
    combinedData.reduce(
      (sum, district) =>
        sum +
        district.averageIncome,
      0
    )

  const averageIncome =
    combinedData.length > 0
      ? totalAverageIncome /
        combinedData.length
      : 0

  const totalHighRisk =
    combinedData.reduce(
      (sum, district) =>
        sum +
        district.highRiskEnterprises,
      0
    )

  return (
    <div>
      <PageHeader
        breadcrumb={[
          {
            label: 'Dashboard',
            href: '/officer/dashboard',
          },
          {
            label: 'District Analytics',
          },
        ]}
        title="District Analytics"
        description="Enterprise distribution, income and risk insights ranked by district."
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
          label="Districts Covered"
          value={combinedData.length}
          icon={HiOutlineMapPin}
        />

        <StatCard
          label="Total Enterprises"
          value={totalEnterprises.toLocaleString(
            'en-IN'
          )}
          icon={HiOutlineBuildingLibrary}
        />

        <StatCard
          label="Avg. Annual Income"
          value={`₹${Math.round(
            averageIncome
          ).toLocaleString('en-IN')}`}
          icon={HiOutlineBanknotes}
        />

        <StatCard
          label="High Risk Enterprises"
          value={totalHighRisk}
          icon={HiOutlineExclamationTriangle}
        />
      </div>

      <Card className="mb-4">
        <h3 className="font-semibold mb-4">
          District Ranking by Average Income
        </h3>

        {ranked.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height={260}
          >
            <BarChart
              data={ranked}
              layout="vertical"
              margin={{
                left: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#E6EBF0"
              />

              <XAxis
                type="number"
                tick={{
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  `₹${(
                    value / 100000
                  ).toFixed(1)}L`
                }
              />

              <YAxis
                type="category"
                dataKey="district"
                tick={{
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
                width={90}
              />

              <Tooltip
                formatter={(value) =>
                  `₹${Number(
                    value
                  ).toLocaleString(
                    'en-IN'
                  )}`
                }
              />

              <Bar
                dataKey="averageIncome"
                fill="#2E7D32"
                radius={[0, 4, 4, 0]}
                name="Average Income"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
            No district analytics available.
          </p>
        )}
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <h3 className="font-semibold">
            District Breakdown
          </h3>
        </div>

        {ranked.length > 0 ? (
          <Table>
            <Thead>
              <Th>District</Th>
              <Th>Enterprises</Th>
              <Th>Avg Annual Income</Th>
              <Th>Avg Risk Score</Th>
              <Th>High Risk Enterprises</Th>
              <Th>Assessments</Th>
              <Th>Risk Level</Th>
            </Thead>

            <tbody>
              {ranked.map(
                (district) => (
                  <Tr
                    key={
                      district.district
                    }
                  >
                    <Td className="font-medium">
                      {
                        district.district
                      }
                    </Td>

                    <Td>
                      {district.totalEnterprises.toLocaleString(
                        'en-IN'
                      )}
                    </Td>

                    <Td>
                      ₹
                      {Number(
                        district.averageIncome
                      ).toLocaleString(
                        'en-IN'
                      )}
                    </Td>

                    <Td>
                      {
                        district.averageRiskScore
                      }
                      /100
                    </Td>

                    <Td>
                      {
                        district.highRiskEnterprises
                      }
                    </Td>

                    <Td>
                      {
                        district.totalAssessments
                      }
                    </Td>

                    <Td>
                      <Badge
                        tone={
                          riskTone[
                            district
                              .riskLevel
                          ] ||
                          'neutral'
                        }
                      >
                        {
                          district.riskLevel
                        }
                      </Badge>
                    </Td>
                  </Tr>
                )
              )}
            </tbody>
          </Table>
        ) : (
          <p className="text-sm text-center text-ink-dim dark:text-ink-dark-dim py-8">
            No district analytics available.
          </p>
        )}
      </Card>
    </div>
  )
}