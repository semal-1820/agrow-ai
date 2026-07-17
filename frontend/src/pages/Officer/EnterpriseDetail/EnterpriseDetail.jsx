import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import PageHeader from '../../../components/ui/PageHeader'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { Table, Thead, Th, Tr, Td } from '../../../components/ui/Table'
import { enterpriseRegistry } from '../../../data/officer'
import { getEnterpriseDetail } from '../../../data/enterpriseDetail'
import { HiOutlinePhone, HiOutlineFlag } from 'react-icons/hi2'

const riskTone = { Low: 'low', Medium: 'medium', High: 'high' }
const tabs = ['Overview', 'Financials', 'Assets & Loans', 'Risk & Health', 'Forecast', 'Documents', 'Timeline']

export default function EnterpriseDetail() {
  const { id } = useParams()
  const [tab, setTab] = useState('Overview')

  const registryEntry = enterpriseRegistry.find((e) => e.id === id)
  const data = getEnterpriseDetail(id, registryEntry)

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: 'Dashboard', href: '/officer/dashboard' },
          { label: 'Enterprise Registry', href: '/officer/enterprise-registry' },
          { label: data.name },
        ]}
        title={data.name}
        description={`${data.sector} · ${data.village}, ${data.district}`}
        actions={
          <>
            <Button variant="outline" size="sm" icon={HiOutlinePhone}>Contact Owner</Button>
            <Button variant="danger" size="sm" icon={HiOutlineFlag}>Flag for Review</Button>
          </>
        }
      />

      {/* Summary strip */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <Card><p className="text-xs text-ink-dim dark:text-ink-dark-dim">Owner</p><p className="font-semibold mt-1">{data.owner}</p></Card>
        <Card><p className="text-xs text-ink-dim dark:text-ink-dark-dim">Status</p><Badge tone="neutral" className="mt-1">{data.status}</Badge></Card>
        <Card><p className="text-xs text-ink-dim dark:text-ink-dark-dim">Health Score</p><p className="text-2xl font-bold mt-1">{data.healthScore}/100</p></Card>
        <Card><p className="text-xs text-ink-dim dark:text-ink-dark-dim">Risk Score</p><div className="flex items-center gap-2 mt-1"><p className="text-2xl font-bold">{data.riskScore}</p><Badge tone={riskTone[data.riskLevel]}>{data.riskLevel}</Badge></div></Card>
        <Card><p className="text-xs text-ink-dim dark:text-ink-dark-dim">Annual Turnover</p><p className="text-lg font-bold mt-1">₹{data.annualTurnover.toLocaleString('en-IN')}</p></Card>
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
        <Card>
          <h3 className="font-semibold mb-2">Business Overview</h3>
          <p className="text-sm text-ink-dim dark:text-ink-dark-dim">{data.description}</p>
          <div className="grid sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border dark:border-border-dark text-sm">
            <div><p className="text-ink-dim dark:text-ink-dark-dim text-xs">Established</p><p className="font-semibold">{data.established}</p></div>
            <div><p className="text-ink-dim dark:text-ink-dark-dim text-xs">Phone</p><p className="font-semibold">{data.phone}</p></div>
            <div><p className="text-ink-dim dark:text-ink-dark-dim text-xs">Enterprise ID</p><p className="font-semibold">{data.id}</p></div>
          </div>
        </Card>
      )}

      {tab === 'Financials' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Income vs Expenses (6 Months)</h3>
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">Balance: <span className="font-semibold text-ink dark:text-ink-dark">₹{data.financials.currentBalance.toLocaleString('en-IN')}</span></p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.financials.monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBF0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip />
              <Bar dataKey="income" fill="#2E7D32" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#FFC107" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {tab === 'Assets & Loans' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold mb-3">Assets</h3>
            <Table><Thead><Th>Asset</Th><Th>Value</Th></Thead>
              <tbody>{data.assets.map((a) => <Tr key={a.name}><Td>{a.name}</Td><Td>₹{a.value.toLocaleString('en-IN')}</Td></Tr>)}</tbody>
            </Table>
            <h3 className="font-semibold mb-3 mt-6">Liabilities</h3>
            <Table><Thead><Th>Liability</Th><Th>Value</Th></Thead>
              <tbody>{data.liabilities.map((l) => <Tr key={l.name}><Td>{l.name}</Td><Td>₹{l.value.toLocaleString('en-IN')}</Td></Tr>)}</tbody>
            </Table>
          </Card>
          <Card>
            <h3 className="font-semibold mb-3">Loan Information</h3>
            <Table><Thead><Th>Loan ID</Th><Th>Type</Th><Th>Outstanding</Th><Th>EMI</Th><Th>Next Due</Th><Th>Status</Th></Thead>
              <tbody>
                {data.loans.map((l) => (
                  <Tr key={l.id}>
                    <Td>{l.id}</Td><Td>{l.type}</Td><Td>₹{l.outstanding.toLocaleString('en-IN')}</Td>
                    <Td>₹{l.emi.toLocaleString('en-IN')}</Td><Td>{l.nextDue}</Td>
                    <Td><Badge tone={l.status === 'Active' ? 'low' : 'high'}>{l.status}</Badge></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      )}

      {tab === 'Risk & Health' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold mb-4">Risk Breakdown</h3>
            <div className="space-y-3">
              {data.riskBreakdown.map((r) => (
                <div key={r.name}>
                  <div className="flex justify-between text-sm mb-1"><span>{r.name}</span><span className="font-semibold">{r.score}/100</span></div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div className="h-full bg-primary-500" style={{ width: `${r.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold mb-1">Recommendations</h3>
            <ul className="space-y-3 mt-3">
              {data.recommendations.map((r, i) => (
                <li key={i} className="text-sm text-ink-dim dark:text-ink-dark-dim border-l-2 border-primary-500 pl-3">{r}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'Forecast' && (
        <Card>
          <h3 className="font-semibold mb-4">Cash Flow Forecast — Next 4 Months</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={data.forecast}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBF0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip />
              <Area dataKey="upper" stroke="none" fill="#2E7D32" fillOpacity={0.08} />
              <Area dataKey="lower" stroke="none" fill="#F8FAFC" fillOpacity={1} />
              <Line dataKey="forecast" stroke="#2E7D32" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      )}

      {tab === 'Documents' && (
        <Card className="grid sm:grid-cols-3 gap-3">
          {data.documents.map((d) => (
            <div key={d} className="border border-border dark:border-border-dark rounded-xl p-4 text-sm font-medium">{d}</div>
          ))}
        </Card>
      )}

      {tab === 'Timeline' && (
        <Card>
          <ul className="space-y-4">
            {data.timeline.map((t, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-500 mt-1.5" />
                  {i < data.timeline.length - 1 && <span className="w-px flex-1 bg-border dark:bg-border-dark mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium">{t.event}</p>
                  <p className="text-xs text-ink-dim dark:text-ink-dark-dim">{t.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
