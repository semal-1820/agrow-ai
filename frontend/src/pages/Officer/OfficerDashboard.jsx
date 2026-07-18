import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'

import {
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineFire,
} from 'react-icons/hi2'

import {
  Table,
  Thead,
  Th,
  Tr,
  Td,
} from '../../components/ui/Table'

import {
  getOfficerDashboard,
  getRiskMonitoring,
  getSectorDistribution,
} from '../../services/officerService'

const COLORS = [
  '#2E7D32',
  '#4CAF50',
  '#FFC107',
  '#2563EB',
  '#94A3B8',
]

export default function OfficerDashboard() {
  const { user } = useAuth()

  const [dashboard, setDashboard] = useState(null)
  const [riskData, setRiskData] = useState([])
  const [sectorDistribution, setSectorDistribution] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOfficerDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const [
          dashboardResponse,
          riskResponse,
          sectorResponse,
        ] = await Promise.all([
          getOfficerDashboard(),
          getRiskMonitoring(),
          getSectorDistribution(),
        ])

        setDashboard(dashboardResponse)

        setRiskData(
          Array.isArray(riskResponse)
            ? riskResponse
            : []
        )

        const formattedSectors =
          Array.isArray(sectorResponse)
            ? sectorResponse.map((sector) => ({
                name:
                  sector.sector ||
                  'Unknown',
                value:
                  sector.count ||
                  0,
              }))
            : []

        setSectorDistribution(
          formattedSectors
        )
      } catch (err) {
        console.error(
          'Officer dashboard loading error:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load officer dashboard.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadOfficerDashboard()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        Loading officer dashboard...
      </div>
    )
  }

  const totalEnterprises =
    dashboard?.totalEnterprises || 0

  const highRisk =
    dashboard?.riskSummary?.high || 0

  const mediumRisk =
    dashboard?.riskSummary?.medium || 0

  const lowRisk =
    dashboard?.riskSummary?.low || 0

  const highRiskEnterprises =
    riskData
      .filter(
        (risk) =>
          risk.level === 'High'
      )
      .sort(
        (a, b) =>
          (b.score || 0) -
          (a.score || 0)
      )

  return (
    <div>
      <PageHeader
        title={`Welcome, ${
          user?.name || 'Officer'
        }`}
        description="Portfolio overview across registered enterprises."
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
          label="Total Enterprises"
          value={totalEnterprises.toLocaleString(
            'en-IN'
          )}
          icon={
            HiOutlineBuildingOffice2
          }
        />

        <StatCard
          label="Low Risk"
          value={lowRisk}
          icon={HiOutlineCheckCircle}
        />

        <StatCard
          label="Medium Risk"
          value={mediumRisk}
          icon={
            HiOutlineExclamationTriangle
          }
        />

        <StatCard
          label="High Risk"
          value={highRisk}
          icon={HiOutlineFire}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <h3 className="font-semibold mb-4">
            Sector Distribution
          </h3>

          {sectorDistribution.length >
          0 ? (
            <ResponsiveContainer
              width="100%"
              height={250}
            >
              <PieChart>
                <Pie
                  data={
                    sectorDistribution
                  }
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
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
              No sector distribution
              data available.
            </p>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">
            Risk Overview
          </h3>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>
                  Low Risk Enterprises
                </span>

                <span className="font-semibold">
                  {lowRisk}
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-primary-500"
                  style={{
                    width:
                      totalEnterprises >
                      0
                        ? `${
                            (lowRisk /
                              totalEnterprises) *
                            100
                          }%`
                        : '0%',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>
                  Medium Risk
                  Enterprises
                </span>

                <span className="font-semibold">
                  {mediumRisk}
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{
                    width:
                      totalEnterprises >
                      0
                        ? `${
                            (mediumRisk /
                              totalEnterprises) *
                            100
                          }%`
                        : '0%',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>
                  High Risk Enterprises
                </span>

                <span className="font-semibold">
                  {highRisk}
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{
                    width:
                      totalEnterprises >
                      0
                        ? `${
                            (highRisk /
                              totalEnterprises) *
                            100
                          }%`
                        : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0 flex items-center justify-between">
          <h3 className="font-semibold">
            High-Risk Enterprises
            Needing Review
          </h3>

          <Badge tone="high">
            {
              highRiskEnterprises.length
            }{' '}
            High Risk
          </Badge>
        </div>

        <div className="p-5 pt-4">
          {highRiskEnterprises.length >
          0 ? (
            <Table>
              <Thead>
                <Th>Enterprise</Th>
                <Th>Type</Th>
                <Th>Village</Th>
                <Th>District</Th>
                <Th>Risk Score</Th>
                <Th>Risk Level</Th>
                <Th>Risk Factors</Th>
              </Thead>

              <tbody>
                {highRiskEnterprises.map(
                  (risk) => (
                    <Tr
                      key={risk._id}
                    >
                      <Td className="font-medium">
                        {risk.enterprise
                          ?.name ||
                          'Unknown'}
                      </Td>

                      <Td>
                        {risk.enterprise
                          ?.type || '-'}
                      </Td>

                      <Td>
                        {risk.enterprise
                          ?.village || '-'}
                      </Td>

                      <Td>
                        {risk.enterprise
                          ?.district || '-'}
                      </Td>

                      <Td>
                        <Badge tone="high">
                          {risk.score ||
                            0}
                          /100
                        </Badge>
                      </Td>

                      <Td>
                        <Badge tone="high">
                          {risk.level ||
                            'High'}
                        </Badge>
                      </Td>

                      <Td>
                        {risk.factors
                          ?.length > 0
                          ? risk.factors
                              .slice(
                                0,
                                2
                              )
                              .join(', ')
                          : 'No factors available'}
                      </Td>
                    </Tr>
                  )
                )}
              </tbody>
            </Table>
          ) : (
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim py-4">
              No high-risk enterprises
              found.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}