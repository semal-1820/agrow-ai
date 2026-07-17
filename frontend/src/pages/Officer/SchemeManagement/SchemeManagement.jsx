import { useState } from 'react'
import PageHeader from '../../../components/ui/PageHeader'
import StatCard from '../../../components/ui/StatCard'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { Table, Thead, Th, Tr, Td } from '../../../components/ui/Table'
import { schemePerformance, schemeApplications, beneficiaries } from '../../../data/schemeManagement'
import { HiOutlineClipboardDocumentCheck, HiOutlineClock, HiOutlineXCircle, HiOutlineBanknotes } from 'react-icons/hi2'

const statusTone = { Pending: 'medium', Approved: 'low', Rejected: 'critical' }
const tabs = ['Applications', 'Scheme Performance', 'Beneficiaries']

export default function SchemeManagement() {
  const [tab, setTab] = useState('Applications')
  const [statusFilter, setStatusFilter] = useState('All')

  const totalPending = schemeApplications.filter((a) => a.status === 'Pending').length
  const totalApproved = schemeApplications.filter((a) => a.status === 'Approved').length
  const totalRejected = schemeApplications.filter((a) => a.status === 'Rejected').length
  const totalDisbursed = schemePerformance.reduce((s, sc) => s + sc.disbursed, 0)

  const filteredApps = statusFilter === 'All' ? schemeApplications : schemeApplications.filter((a) => a.status === statusFilter)

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/officer/dashboard' }, { label: 'Scheme Management' }]}
        title="Government Scheme Management"
        description="Review applications, track scheme performance and disbursed beneficiaries."
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pending Review" value={totalPending} icon={HiOutlineClock} />
        <StatCard label="Approved" value={totalApproved} icon={HiOutlineClipboardDocumentCheck} />
        <StatCard label="Rejected" value={totalRejected} icon={HiOutlineXCircle} />
        <StatCard label="Total Disbursed" value={`₹${(totalDisbursed / 10000000).toFixed(1)} Cr`} icon={HiOutlineBanknotes} />
      </div>

      <div className="flex items-center gap-1 border-b border-border dark:border-border-dark mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-primary-500 text-primary-600 dark:text-primary-300' : 'border-transparent text-ink-dim dark:text-ink-dark-dim'
            }`}>{t}</button>
        ))}
      </div>

      {tab === 'Applications' && (
        <>
          <div className="flex items-center gap-2 mb-4">
            {['All', 'Pending', 'Approved', 'Rejected'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  statusFilter === s ? 'bg-primary-500 text-white border-primary-500' : 'border-border dark:border-border-dark text-ink-dim dark:text-ink-dark-dim'
                }`}>{s}</button>
            ))}
          </div>
          <Card padded={false}>
            <Table>
              <Thead><Th>App ID</Th><Th>Applicant</Th><Th>Enterprise</Th><Th>Scheme</Th><Th>Amount</Th><Th>Status</Th><Th></Th></Thead>
              <tbody>
                {filteredApps.map((a) => (
                  <Tr key={a.id}>
                    <Td>{a.id}</Td><Td className="font-medium">{a.applicant}</Td><Td>{a.enterprise}</Td><Td>{a.scheme}</Td>
                    <Td>₹{a.amount.toLocaleString('en-IN')}</Td>
                    <Td><Badge tone={statusTone[a.status]}>{a.status}</Badge></Td>
                    <Td>
                      {a.status === 'Pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Approve</Button>
                          <Button size="sm" variant="ghost">Reject</Button>
                        </div>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </>
      )}

      {tab === 'Scheme Performance' && (
        <Card padded={false}>
          <Table>
            <Thead><Th>Scheme</Th><Th>Applications</Th><Th>Approved</Th><Th>Rejected</Th><Th>Pending</Th><Th>Disbursed</Th></Thead>
            <tbody>
              {schemePerformance.map((s) => (
                <Tr key={s.name}>
                  <Td className="font-medium">{s.name}</Td><Td>{s.applications}</Td>
                  <Td className="text-primary-600 dark:text-primary-300 font-semibold">{s.approved}</Td>
                  <Td className="text-red-600 dark:text-red-400 font-semibold">{s.rejected}</Td>
                  <Td>{s.pending}</Td><Td>₹{(s.disbursed / 10000000).toFixed(2)} Cr</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {tab === 'Beneficiaries' && (
        <Card padded={false}>
          <Table>
            <Thead><Th>Beneficiary</Th><Th>Enterprise</Th><Th>Scheme</Th><Th>Amount Received</Th><Th>Disbursed On</Th></Thead>
            <tbody>
              {beneficiaries.map((b, i) => (
                <Tr key={i}>
                  <Td className="font-medium">{b.name}</Td><Td>{b.enterprise}</Td><Td>{b.scheme}</Td>
                  <Td>₹{b.amountReceived.toLocaleString('en-IN')}</Td><Td>{b.disbursedOn}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  )
}
