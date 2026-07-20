import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import {
  Table,
  Thead,
  Th,
  Tr,
  Td,
} from '../../components/ui/Table'
import {
  HiOutlineBanknotes,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
} from 'react-icons/hi2'

import { getEnterprises } from '../../services/enterpriseService'
import { getFinancialRecords } from '../../services/financialService'
import { PageSkeleton } from '../../components/ui/Skeleton'

const tabs = [
  'Overview',
  'Income',
  'Expenses',
  'Transactions',
]

export default function FinancialRecords() {
  const [tab, setTab] = useState('Overview')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadFinancialRecords = async () => {
      try {
        setLoading(true)

        const enterprises = await getEnterprises()

        if (!enterprises || enterprises.length === 0) {
          setRecords([])
          return
        }

        const enterpriseId = enterprises[0]._id

        const financialData =
          await getFinancialRecords()

        const enterpriseRecords =
          financialData.filter(
            (record) =>
              record.enterprise === enterpriseId ||
              record.enterprise?._id === enterpriseId
          )

        setRecords(enterpriseRecords)
      } catch (err) {
        console.error(
          'Financial records loading error:',
          err
        )

        setError(
          'Unable to load financial records.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadFinancialRecords()
  }, [])

  const latestRecord =
    records.length > 0
      ? records[records.length - 1]
      : null

  const currentBalance = latestRecord
    ? (latestRecord.revenue || 0) -
      (latestRecord.expenses || 0) -
      (latestRecord.loanEMI || 0)
    : 0

  const totalIncome =
    latestRecord?.revenue || 0

  const totalExpenses =
    latestRecord?.expenses || 0

  const chartData = records
    .slice(-6)
    .map((record) => ({
      month: record.month,
      income: record.revenue || 0,
      expenses: record.expenses || 0,
    }))

  const tableData = records.flatMap(
    (record) => [
      {
        id: `${record._id}-income`,
        date: record.month || 'N/A',
        description: 'Monthly Revenue',
        mode: 'Recorded',
        type: 'Credit',
        amount: record.revenue || 0,
      },
      {
        id: `${record._id}-expense`,
        date: record.month || 'N/A',
        description: 'Monthly Expenses',
        mode: 'Recorded',
        type: 'Debit',
        amount: -(record.expenses || 0),
      },
    ]
  )

  const filteredTransactions =
    tableData.filter(
      (transaction) =>
        tab === 'Transactions' ||
        (tab === 'Income' &&
          transaction.type === 'Credit') ||
        (tab === 'Expenses' &&
          transaction.type === 'Debit')
    )

  if (loading) {
    return <PageSkeleton />
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
            label: 'Financial Records',
          },
        ]}
        title="Financial Records"
        description="Track income, expenses, savings and financial activity in one place."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Current Balance"
          value={`₹${currentBalance.toLocaleString(
            'en-IN'
          )}`}
          icon={HiOutlineBanknotes}
        />

        <StatCard
          label="Latest Monthly Income"
          value={`₹${totalIncome.toLocaleString(
            'en-IN'
          )}`}
          icon={HiOutlineArrowTrendingUp}
        />

        <StatCard
          label="Latest Monthly Expenses"
          value={`₹${totalExpenses.toLocaleString(
            'en-IN'
          )}`}
          changeTone="negative"
          icon={HiOutlineArrowTrendingDown}
        />
      </div>

      <div className="flex items-center gap-1 border-b border-border dark:border-border-dark mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-primary-500 text-primary-600 dark:text-primary-300'
                : 'border-transparent text-ink-dim dark:text-ink-dark-dim'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="grid gap-4">
          <Card>
            <h3 className="font-semibold mb-4">
              Income vs Expenses
            </h3>

            {chartData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={240}
              >
                <BarChart data={chartData}>
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

                  <Bar
                    dataKey="income"
                    fill="#2E7D32"
                    radius={[4, 4, 0, 0]}
                    name="Income"
                  />

                  <Bar
                    dataKey="expenses"
                    fill="#FFC107"
                    radius={[4, 4, 0, 0]}
                    name="Expenses"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
                No financial records available.
              </p>
            )}
          </Card>
        </div>
      )}

      {tab !== 'Overview' && (
        <>
          {filteredTransactions.length > 0 ? (
            <Table>
              <Thead>
                <Th>Month</Th>
                <Th>Description</Th>
                <Th>Mode</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
              </Thead>

              <tbody>
                {filteredTransactions.map(
                  (transaction) => (
                    <Tr key={transaction.id}>
                      <Td>
                        {transaction.date}
                      </Td>

                      <Td>
                        {transaction.description}
                      </Td>

                      <Td>
                        {transaction.mode}
                      </Td>

                      <Td>
                        <Badge
                          tone={
                            transaction.type ===
                            'Credit'
                              ? 'low'
                              : 'neutral'
                          }
                        >
                          {transaction.type}
                        </Badge>
                      </Td>

                      <Td
                        className={
                          transaction.amount > 0
                            ? 'text-primary-600 dark:text-primary-300 font-semibold'
                            : 'font-semibold'
                        }
                      >
                        {transaction.amount > 0
                          ? '+'
                          : '-'}
                        ₹
                        {Math.abs(
                          transaction.amount
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
            <Card>
              <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
                No financial records available.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  )
}