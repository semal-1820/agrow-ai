import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import { Table, Thead, Th, Tr, Td } from '../../components/ui/Table'
import { HiOutlineBanknotes, HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown } from 'react-icons/hi2'
import { monthlyFinancials, expenseCategories, transactions, currentBalance } from '../../data/financials'

const COLORS = ['#2E7D32', '#4CAF50', '#75C47D', '#FFC107', '#2563EB', '#94A3B8']
const tabs = ['Overview', 'Income', 'Expenses', 'Transactions']

export default function FinancialRecords() {
  const [tab, setTab] = useState('Overview')

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Financial Records' }]}
        title="Financial Records"
        description="Track income, expenses, savings and every transaction in one place."
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Current Balance" value={`₹${currentBalance.toLocaleString('en-IN')}`} icon={HiOutlineBanknotes} />
        <StatCard label="Total Income (Jul)" value="₹78,650" change="+3.2%" icon={HiOutlineArrowTrendingUp} />
        <StatCard label="Total Expenses (Jul)" value="₹45,320" change="-1.5%" changeTone="negative" icon={HiOutlineArrowTrendingDown} />
      </div>

      <div className="flex items-center gap-1 border-b border-border dark:border-border-dark mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-primary-500 text-primary-600 dark:text-primary-300' : 'border-transparent text-ink-dim dark:text-ink-dark-dim'
            }`}>{t}</button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold mb-4">Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyFinancials}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBF0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip />
                <Bar dataKey="income" fill="#2E7D32" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#FFC107" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <h3 className="font-semibold mb-4">Top Expense Categories</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={expenseCategories} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {expenseCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {tab !== 'Overview' && (
        <Table>
          <Thead><Th>Date</Th><Th>Description</Th><Th>Mode</Th><Th>Type</Th><Th>Amount</Th></Thead>
          <tbody>
            {transactions
              .filter((t) => tab === 'Transactions' || (tab === 'Income' && t.type === 'Credit') || (tab === 'Expenses' && t.type === 'Debit'))
              .map((t) => (
                <Tr key={t.id}>
                  <Td>{t.date}</Td><Td>{t.description}</Td><Td>{t.mode}</Td>
                  <Td><Badge tone={t.type === 'Credit' ? 'low' : 'neutral'}>{t.type}</Badge></Td>
                  <Td className={t.amount > 0 ? 'text-primary-600 dark:text-primary-300 font-semibold' : 'font-semibold'}>
                    {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                  </Td>
                </Tr>
              ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}
