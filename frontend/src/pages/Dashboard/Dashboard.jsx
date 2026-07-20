import { useEffect, useState } from 'react'
import {
  HiOutlineBanknotes,
  HiOutlineArrowTrendingDown,
  HiOutlineHeart,
} from 'react-icons/hi2'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Link } from 'react-router-dom'

import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

import { getEnterprises } from '../../services/enterpriseService'
import { getFinancialRecords } from '../../services/financialService'
import { getRiskAssessment } from '../../services/riskService'
import { getEnterpriseHealth } from '../../services/healthService'
import { getNotifications } from '../../services/notificationService'
import { PageSkeleton } from '../../components/ui/Skeleton'

export default function Dashboard() {
  const { user } = useAuth()

  const [financials, setFinancials] = useState([])
  const [risk, setRisk] = useState(null)
  const [health, setHealth] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const enterprises = await getEnterprises()

        if (!enterprises || enterprises.length === 0) {
          setLoading(false)
          return
        }

        const enterpriseId = enterprises[0]._id

        const financialData = await getFinancialRecords()

        const enterpriseFinancials = financialData.filter(
          (record) =>
            record.enterprise === enterpriseId ||
            record.enterprise?._id === enterpriseId
        )

        setFinancials(enterpriseFinancials)

        try {
          const riskData =
            await getRiskAssessment(enterpriseId)

          setRisk(riskData)
        } catch {
          // No risk assessment yet — expected on first visit.
        }

        try {
          const healthData =
            await getEnterpriseHealth(enterpriseId)

          setHealth(healthData)
        } catch {
          // No health score yet — expected on first visit.
        }

        try {
          const notificationData =
            await getNotifications()

          setAlerts(notificationData)
        } catch {
          // No notifications yet.
        }
      } catch (error) {
        console.error(
          'Dashboard loading error:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const latestRecord =
    financials.length > 0
      ? financials[financials.length - 1]
      : null

  const currentBalance = latestRecord
    ? (latestRecord.revenue || 0) -
      (latestRecord.expenses || 0) -
      (latestRecord.loanEMI || 0)
    : 0

  const monthlyExpenses =
    latestRecord?.expenses || 0

  const monthlyFinancials = financials
    .slice(-6)
    .map((record) => ({
      month: record.month,
      income: record.revenue || 0,
      net:
        (record.revenue || 0) -
        (record.expenses || 0) -
        (record.loanEMI || 0),
    }))

  const riskScore = risk?.score ?? 0
  const riskLevel = risk?.level || 'Not Assessed'

  const getRiskTone = () => {
    if (riskLevel === 'High') return 'high'
    if (riskLevel === 'Medium') return 'medium'
    return 'low'
  }

  if (loading) {
    return <PageSkeleton />
  }

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.name || 'User'}`}
        description="Here's your business overview."
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Current Balance"
          value={`₹${currentBalance.toLocaleString(
            'en-IN'
          )}`}
          change="Based on latest financial record"
          icon={HiOutlineBanknotes}
        />

        <StatCard
          label="Monthly Expenses"
          value={`₹${monthlyExpenses.toLocaleString(
            'en-IN'
          )}`}
          change="Latest recorded expenses"
          changeTone="negative"
          icon={HiOutlineArrowTrendingDown}
        />

        <StatCard
          label="Business Health"
          value={`${health?.healthScore ?? 0}/100`}
          change={health?.status || 'Not Available'}
          icon={HiOutlineHeart}
        />

        <Card className="flex flex-col justify-between">
          <span className="text-xs font-medium text-ink-dim dark:text-ink-dark-dim">
            Risk Level
          </span>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-bold">
              {riskScore}/100
            </span>

            <Badge tone={getRiskTone()}>
              {riskLevel}
            </Badge>
          </div>

          <Link
            to="/app/risk-intelligence"
            className="text-xs font-semibold text-primary-600 dark:text-primary-300 mt-2"
          >
            View Details
          </Link>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">
                Cash Flow (Last 6 Months)
              </h3>

              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Income vs net cash flow
              </p>
            </div>

            <Link
              to="/app/forecast-studio"
              className="text-xs font-semibold text-primary-600 dark:text-primary-300"
            >
              View Details
            </Link>
          </div>

          <ResponsiveContainer
            width="100%"
            height={220}
          >
            <AreaChart data={monthlyFinancials}>
              <defs>
                <linearGradient
                  id="income"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#2E7D32"
                    stopOpacity={0.3}
                  />

                  <stop
                    offset="95%"
                    stopColor="#2E7D32"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

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
                width={40}
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="income"
                stroke="#2E7D32"
                fill="url(#income)"
                strokeWidth={2}
                name="Income"
              />

              <Area
                type="monotone"
                dataKey="net"
                stroke="#2563EB"
                fill="transparent"
                strokeWidth={2}
                name="Net Cash Flow"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-semibold mb-1">
            AI Insight
          </h3>

          <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
            {risk?.factors?.[0]
              ? `${risk.factors[0]}. ${
                  risk.suggestions?.[0] || ''
                }`
              : 'Generate a risk assessment to receive financial insights.'}
          </p>

          <Link to="/app/scheme-advisor">
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
            >
              View Schemes
            </Button>
          </Link>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              Upcoming EMI
            </h3>

            <Badge tone="high">
              ₹
              {(
                latestRecord?.loanEMI || 0
              ).toLocaleString('en-IN')}
            </Badge>
          </div>

          <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
            Based on your latest financial record
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              Recent Alerts
            </h3>

            <Link
              to="/app/notifications"
              className="text-xs font-semibold text-primary-600 dark:text-primary-300"
            >
              View All
            </Link>
          </div>

          <ul className="space-y-2">
            {alerts.length > 0 ? (
              alerts.slice(0, 2).map((alert) => (
                <li
                  key={alert._id}
                  className="text-sm flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />

                  <span>{alert.title}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-ink-dim dark:text-ink-dark-dim">
                No recent notifications.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  )
}