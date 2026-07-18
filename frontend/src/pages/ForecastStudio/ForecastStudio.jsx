import { useEffect, useState } from 'react'
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'

import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import {
  Table,
  Thead,
  Th,
  Tr,
  Td,
} from '../../components/ui/Table'

import { getEnterprises } from '../../services/enterpriseService'
import {
  generateForecast,
  getForecast,
} from '../../services/forecastService'

export default function ForecastStudio() {
  const [enterpriseId, setEnterpriseId] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadForecast = async () => {
      try {
        setLoading(true)

        const enterprises = await getEnterprises()

        if (!enterprises || enterprises.length === 0) {
          setError(
            'No enterprise found. Create an enterprise first.'
          )
          return
        }

        const id = enterprises[0]._id
        setEnterpriseId(id)

        try {
          const data = await getForecast(id)
          setForecast(data)
        } catch (err) {
          console.log(
            'No existing forecast available.'
          )
        }
      } catch (err) {
        console.error(
          'Forecast loading error:',
          err
        )

        setError(
          'Unable to load forecast information.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadForecast()
  }, [])

  const handleGenerateForecast = async () => {
    if (!enterpriseId) {
      return
    }

    try {
      setGenerating(true)
      setError('')

      const data =
        await generateForecast(enterpriseId)

      setForecast(data)
    } catch (err) {
      console.error(
        'Forecast generation error:',
        err
      )

      setError(
        err.response?.data?.message ||
          'Unable to generate forecast.'
      )
    } finally {
      setGenerating(false)
    }
  }

  const cashFlow =
    forecast?.cashFlowForecast || []

  const revenues =
    forecast?.revenueProjection || []

  const expenses =
    forecast?.expenseProjection || []

  const forecastData = cashFlow.map(
    (value, index) => ({
      month: `Month ${index + 1}`,
      cashFlow: value,
      revenue: revenues[index] || 0,
      expenses: expenses[index] || 0,
    })
  )

  const confidence = forecast?.confidence
    ? Math.round(forecast.confidence * 100)
    : 0

  if (loading) {
    return (
      <div className="p-6">
        Loading forecast...
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[
          {
            label: 'Dashboard',
            href: '/app/dashboard',
          },
          {
            label: 'Forecast Studio',
          },
        ]}
        title="Cash Flow Forecast"
        description="AI-powered 6-month financial projections based on your historical financial records."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      <div className="flex justify-end mb-4">
        <Button
          onClick={handleGenerateForecast}
          disabled={
            generating || !enterpriseId
          }
        >
          {generating
            ? 'Generating...'
            : forecast
              ? 'Regenerate Forecast'
              : 'Generate Forecast'}
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
            Forecast Confidence
          </p>

          <p className="text-2xl font-bold mt-1">
            {confidence}%
          </p>
        </Card>

        <Card>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
            Model
          </p>

          <p className="text-sm font-semibold mt-2">
            Linear Regression
          </p>
        </Card>

        <Card>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
            Forecast Horizon
          </p>

          <p className="text-sm font-semibold mt-2">
            6 Months
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold mb-4">
          6-Month Financial Projection
        </h3>

        {forecastData.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <ComposedChart
              data={forecastData}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E6EBF0"
              />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={50}
              />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2E7D32"
                strokeWidth={2}
                name="Revenue"
              />

              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#FFC107"
                strokeWidth={2}
                name="Expenses"
              />

              <Line
                type="monotone"
                dataKey="cashFlow"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                name="Cash Flow"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No forecast available yet.
            </p>

            <p className="text-xs text-ink-dim dark:text-ink-dark-dim mt-1">
              Generate a forecast using your
              historical financial records.
            </p>
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-3">
            Projection Table
          </h3>

          {forecastData.length > 0 ? (
            <Table>
              <Thead>
                <Th>Month</Th>
                <Th>Revenue</Th>
                <Th>Expenses</Th>
                <Th>Cash Flow</Th>
              </Thead>

              <tbody>
                {forecastData.map(
                  (item) => (
                    <Tr key={item.month}>
                      <Td>
                        {item.month}
                      </Td>

                      <Td className="font-semibold">
                        ₹
                        {item.revenue.toLocaleString(
                          'en-IN'
                        )}
                      </Td>

                      <Td>
                        ₹
                        {item.expenses.toLocaleString(
                          'en-IN'
                        )}
                      </Td>

                      <Td className="font-semibold">
                        ₹
                        {item.cashFlow.toLocaleString(
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
              Generate a forecast to view
              projections.
            </p>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">
            Forecast Information
          </h3>

          <ul className="space-y-3">
            <li className="flex items-center justify-between text-sm">
              <span>Revenue Projection</span>
              <Badge tone="low">
                Included
              </Badge>
            </li>

            <li className="flex items-center justify-between text-sm">
              <span>Expense Projection</span>
              <Badge tone="low">
                Included
              </Badge>
            </li>

            <li className="flex items-center justify-between text-sm">
              <span>Cash Flow Forecast</span>
              <Badge tone="low">
                Included
              </Badge>
            </li>

            <li className="flex items-center justify-between text-sm">
              <span>Confidence Score</span>
              <Badge
                tone={
                  confidence >= 70
                    ? 'low'
                    : 'medium'
                }
              >
                {confidence}%
              </Badge>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}