import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Table, Thead, Th, Tr, Td } from '../../components/ui/Table'
import { enterprise } from '../../data/enterprise'
import { HiOutlinePencilSquare } from 'react-icons/hi2'
import { useState } from 'react'

const tabs = ['Overview', 'Assets', 'Liabilities', 'Loans', 'Documents']

export default function MyEnterprise() {
  const [tab, setTab] = useState('Overview')

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'My Enterprise' }]}
        title="Business Profile"
        description="Manage your enterprise details, assets, liabilities and documents."
        actions={<Button icon={HiOutlinePencilSquare} variant="outline">Edit Profile</Button>}
      />

      <Card className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-full md:w-40 h-28 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 text-xs font-medium shrink-0">
          Farm photo
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold">{enterprise.name}</h2>
            {enterprise.verified && <Badge tone="low">Verified</Badge>}
          </div>
          <p className="text-sm text-ink-dim dark:text-ink-dark-dim">{enterprise.type} · {enterprise.village}, {enterprise.district}, {enterprise.state}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
            <div><p className="text-ink-dim dark:text-ink-dark-dim text-xs">Business ID</p><p className="font-semibold">{enterprise.id}</p></div>
            <div><p className="text-ink-dim dark:text-ink-dark-dim text-xs">Est. Year</p><p className="font-semibold">{enterprise.established}</p></div>
            <div><p className="text-ink-dim dark:text-ink-dark-dim text-xs">Employees</p><p className="font-semibold">{enterprise.employees}</p></div>
            <div><p className="text-ink-dim dark:text-ink-dark-dim text-xs">Annual Turnover</p><p className="font-semibold">₹{enterprise.annualTurnover.toLocaleString('en-IN')}</p></div>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-1 border-b border-border dark:border-border-dark mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-primary-500 text-primary-600 dark:text-primary-300' : 'border-transparent text-ink-dim dark:text-ink-dark-dim'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <Card><p className="text-sm text-ink-dim dark:text-ink-dark-dim">{enterprise.description}</p></Card>
      )}

      {tab === 'Assets' && (
        <Table>
          <Thead><Th>Asset</Th><Th>Value</Th></Thead>
          <tbody>
            {enterprise.assets.map((a) => (
              <Tr key={a.name}><Td>{a.name}</Td><Td>₹{a.value.toLocaleString('en-IN')}</Td></Tr>
            ))}
          </tbody>
        </Table>
      )}

      {tab === 'Liabilities' && (
        <Table>
          <Thead><Th>Liability</Th><Th>Value</Th></Thead>
          <tbody>
            {enterprise.liabilities.map((l) => (
              <Tr key={l.name}><Td>{l.name}</Td><Td>₹{l.value.toLocaleString('en-IN')}</Td></Tr>
            ))}
          </tbody>
        </Table>
      )}

      {tab === 'Loans' && (
        <Table>
          <Thead><Th>Loan ID</Th><Th>Type</Th><Th>Outstanding</Th><Th>EMI</Th><Th>Next Due</Th><Th>Status</Th></Thead>
          <tbody>
            {enterprise.loans.map((l) => (
              <Tr key={l.id}>
                <Td>{l.id}</Td><Td>{l.type}</Td><Td>₹{l.outstanding.toLocaleString('en-IN')}</Td>
                <Td>₹{l.emi.toLocaleString('en-IN')}</Td><Td>{l.nextDue}</Td>
                <Td><Badge tone="low">{l.status}</Badge></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {tab === 'Documents' && (
        <Card className="grid sm:grid-cols-3 gap-3">
          {enterprise.documents.map((d) => (
            <div key={d} className="border border-border dark:border-border-dark rounded-xl p-4 text-sm font-medium">{d}</div>
          ))}
        </Card>
      )}
    </div>
  )
}
