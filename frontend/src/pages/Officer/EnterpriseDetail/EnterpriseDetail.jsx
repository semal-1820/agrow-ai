import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

import PageHeader from '../../../components/ui/PageHeader'
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
  getEnterpriseById,
  getEnterpriseFinancials,
  getEnterpriseRisk,
  getEnterpriseHealth,
  getEnterpriseForecast,
} from '../../../services/officerService'

const riskTone = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
}

const tabs = [
  'Overview',
  'Financials',
  'Assets & Loans',
  'Risk & Health',
  'Forecast',
]

export default function EnterpriseDetail() {
  const { id } = useParams()

  const [tab, setTab] = useState('Overview')
  const [enterprise, setEnterprise] = useState(null)
  const [financials, setFinancials] = useState([])
  const [risk, setRisk] = useState(null)
  const [health, setHealth] = useState(null)
  const [forecast, setForecast] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadEnterprise = async () => {
      try {
        setLoading(true)
        setError('')

        const [
          enterpriseData,
          financialData,
          riskData,
          healthData,
          forecastData,
        ] = await Promise.all([
          getEnterpriseById(id),
          getEnterpriseFinancials(id),
          getEnterpriseRisk(id),
          getEnterpriseHealth(id),
          getEnterpriseForecast(id),
        ])

        setEnterprise(enterpriseData)

        setFinancials(
          Array.isArray(financialData)
            ? financialData
            : financialData.records || []
        )

        setRisk(riskData)
        setHealth(healthData)
        setForecast(forecastData)
      } catch (err) {
        console.error(
          'Enterprise detail loading error:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load enterprise details.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadEnterprise()
  }, [id])

  if (loading) {
    return (
      <div className="p-6">
        Loading enterprise details...
      </div>
    )
  }

  if (!enterprise) {
    return (
      <div>
        <PageHeader
          title="Enterprise Details"
        />

        <Card>
          <p className="text-sm text-red-500">
            {error ||
              'Enterprise not found.'}
          </p>
        </Card>
      </div>
    )
  }

  const owner =
    typeof enterprise.owner === 'object'
      ? enterprise.owner
      : null

  const riskScore =
    risk?.score ?? 0

  const riskLevel =
    risk?.level || 'Low'

  const healthScore =
    health?.score ?? 0

  const latestFinancial =
    financials.length > 0
      ? financials[
          financials.length - 1
        ]
      : null

  const chartData =
    financials.map((record) => ({
      month: record.month,
      income: record.revenue || 0,
      expenses: record.expenses || 0,
    }))

  const forecastData =
    forecast?.forecastData?.forecast ||
    forecast?.forecast ||
    []

  return (
    <div>
      <PageHeader
        breadcrumb={[
          {
            label: 'Dashboard',
            href: '/officer/dashboard',
          },
          {
            label: 'Enterprise Registry',
            href: '/officer/enterprise-registry',
          },
          {
            label: enterprise.name,
          },
        ]}
        title={enterprise.name}
        description={`${
          enterprise.type || 'Enterprise'
        } · ${
          enterprise.village || 'N/A'
        }, ${
          enterprise.district || 'N/A'
        }`}
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <Card>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
            Owner
          </p>

          <p className="font-semibold mt-1">
            {owner?.name || 'N/A'}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
            Sector
          </p>

          <Badge
            tone="neutral"
            className="mt-1"
          >
            {enterprise.type || 'N/A'}
          </Badge>
        </Card>

        <Card>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
            Health Score
          </p>

          <p className="text-2xl font-bold mt-1">
            {healthScore}/100
          </p>
        </Card>

        <Card>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
            Risk Score
          </p>

          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold">
              {riskScore}
            </p>

            <Badge
              tone={
                riskTone[riskLevel] ||
                'neutral'
              }
            >
              {riskLevel}
            </Badge>
          </div>
        </Card>

        <Card>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
            Annual Income
          </p>

          <p className="text-lg font-bold mt-1">
            ₹
            {(
              enterprise.annualIncome || 0
            ).toLocaleString('en-IN')}
          </p>
        </Card>
      </div>

      <div className="flex items-center gap-1 border-b border-border dark:border-border-dark mb-5 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() =>
              setTab(item)
            }
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === item
                ? 'border-primary-500 text-primary-600 dark:text-primary-300'
                : 'border-transparent text-ink-dim dark:text-ink-dark-dim'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <Card>
          <h3 className="font-semibold mb-4">
            Business Overview
          </h3>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Enterprise ID
              </p>

              <p className="font-semibold mt-1 break-all">
                {enterprise._id}
              </p>
            </div>

            <div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Village
              </p>

              <p className="font-semibold mt-1">
                {enterprise.village ||
                  'N/A'}
              </p>
            </div>

            <div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                District
              </p>

              <p className="font-semibold mt-1">
                {enterprise.district ||
                  'N/A'}
              </p>
            </div>

            <div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                State
              </p>

              <p className="font-semibold mt-1">
                {enterprise.state ||
                  'N/A'}
              </p>
            </div>

            <div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Employees
              </p>

              <p className="font-semibold mt-1">
                {enterprise.employees ??
                  0}
              </p>
            </div>

            <div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Owner Email
              </p>

              <p className="font-semibold mt-1">
                {owner?.email || 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {tab === 'Financials' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              Income vs Expenses
            </h3>

            {latestFinancial && (
              <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
                Latest Net:{' '}

                <span className="font-semibold text-ink dark:text-ink-dark">
                  ₹
                  {(
                    (latestFinancial.revenue ||
                      0) -
                    (latestFinancial.expenses ||
                      0)
                  ).toLocaleString(
                    'en-IN'
                  )}
                </span>
              </p>
            )}
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={240}
            >
              <BarChart
                data={chartData}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E6EBF0"
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 12,
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
                  width={50}
                />

                <Tooltip />

                <Bar
                  dataKey="income"
                  fill="#2E7D32"
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                  name="Income"
                />

                <Bar
                  dataKey="expenses"
                  fill="#FFC107"
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                  name="Expenses"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No financial records
              available.
            </p>
          )}
        </Card>
      )}

      {tab === 'Assets & Loans' && (
        <Table>
          <Thead>
            <Th>Month</Th>
            <Th>Assets</Th>
            <Th>Liabilities</Th>
            <Th>Loan EMI</Th>
          </Thead>

          <tbody>
            {financials.map(
              (record) => (
                <Tr
                  key={record._id}
                >
                  <Td>
                    {record.month ||
                      'N/A'}
                  </Td>

                  <Td>
                    ₹
                    {(
                      record.assets || 0
                    ).toLocaleString(
                      'en-IN'
                    )}
                  </Td>

                  <Td>
                    ₹
                    {(
                      record.liabilities ||
                      0
                    ).toLocaleString(
                      'en-IN'
                    )}
                  </Td>

                  <Td>
                    ₹
                    {(
                      record.loanEMI || 0
                    ).toLocaleString(
                      'en-IN'
                    )}
                  </Td>
                </Tr>
              )
            )}
          </tbody>
        </Table>
      )}

      {tab === 'Risk & Health' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold mb-3">
              Risk Assessment
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <p className="text-3xl font-bold">
                {riskScore}
              </p>

              <Badge
                tone={
                  riskTone[riskLevel] ||
                  'neutral'
                }
              >
                {riskLevel}
              </Badge>
            </div>

            <h4 className="text-sm font-semibold mb-2">
              Risk Factors
            </h4>

            {risk?.factors?.length > 0 ? (
              <ul className="space-y-2">
                {risk.factors.map(
                  (factor, index) => (
                    <li
                      key={index}
                      className="text-sm text-ink-dim dark:text-ink-dark-dim"
                    >
                      • {factor}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
                No risk factors
                available.
              </p>
            )}
          </Card>

          <Card>
            <h3 className="font-semibold mb-3">
              Health & Recommendations
            </h3>

            <p className="text-3xl font-bold mb-4">
              {healthScore}/100
            </p>

            <ul className="space-y-3">
              {(
                risk?.suggestions ||
                health?.recommendations ||
                []
              ).map(
                (
                  suggestion,
                  index
                ) => (
                  <li
                    key={index}
                    className="text-sm text-ink-dim dark:text-ink-dark-dim border-l-2 border-primary-500 pl-3"
                  >
                    {suggestion}
                  </li>
                )
              )}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'Forecast' && (
        <Card>
          <h3 className="font-semibold mb-4">
            Cash Flow Forecast
          </h3>

          {forecastData.length > 0 ? (
            <Table>
              <Thead>
                <Th>Period</Th>
                <Th>Forecast</Th>
              </Thead>

              <tbody>
                {forecastData.map(
                  (item, index) => (
                    <Tr key={index}>
                      <Td>
                        {item.month ||
                          `Month ${
                            index + 1
                          }`}
                      </Td>

                      <Td>
                        ₹
                        {Number(
                          item.predicted_profit ??
                            item.forecast ??
                            item
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
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No forecast has been
              generated for this
              enterprise.
            </p>
          )}
        </Card>
      )}
    </div>
  )
}