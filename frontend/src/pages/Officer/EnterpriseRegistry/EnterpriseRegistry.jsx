import { useState, useMemo } from 'react'
import PageHeader from '../../../components/ui/PageHeader'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { Table, Thead, Th, Tr, Td } from '../../../components/ui/Table'
import { enterpriseRegistry } from '../../../data/officer'
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2'

const riskTone = { Low: 'low', Medium: 'medium', High: 'high' }

export default function EnterpriseRegistry() {
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('All')

  const filtered = useMemo(() => {
    return enterpriseRegistry.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.owner.toLowerCase().includes(search.toLowerCase())
      const matchesRisk = riskFilter === 'All' || e.risk === riskFilter
      return matchesSearch && matchesRisk
    })
  }, [search, riskFilter])

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/officer/dashboard' }, { label: 'Enterprise Registry' }]}
        title="Enterprise Registry"
        description="Search and filter all enterprises under your portfolio."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2 bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-xl px-3 py-2.5 flex-1">
          <HiOutlineMagnifyingGlass className="text-ink-dim dark:text-ink-dark-dim" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search enterprises, owners..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}
          className="border border-border dark:border-border-dark rounded-xl px-3 py-2.5 text-sm bg-card dark:bg-card-dark">
          <option>All</option><option>Low</option><option>Medium</option><option>High</option>
        </select>
      </div>

      <Card padded={false}>
        <Table>
          <Thead><Th>Enterprise ID</Th><Th>Name</Th><Th>Owner</Th><Th>Village</Th><Th>Sector</Th><Th>Risk</Th><Th>Status</Th></Thead>
          <tbody>
            {filtered.map((e) => (
              <Tr key={e.id}>
                <Td>{e.id}</Td><Td className="font-medium">{e.name}</Td><Td>{e.owner}</Td><Td>{e.village}</Td><Td>{e.sector}</Td>
                <Td><Badge tone={riskTone[e.risk]}>{e.risk}</Badge></Td>
                <Td><Badge tone="neutral">{e.status}</Badge></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
        {filtered.length === 0 && <p className="text-sm text-center text-ink-dim dark:text-ink-dark-dim py-8">No enterprises match your filters.</p>}
      </Card>
    </div>
  )
}
