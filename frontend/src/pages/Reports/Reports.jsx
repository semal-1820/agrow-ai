import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Table, Thead, Th, Tr, Td } from '../../components/ui/Table'
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2'

const reportTypes = [
  { name: 'Enterprise Financial Report', desc: 'Full income, expense and loan summary' },
  { name: 'Risk Summary Report', desc: 'Risk score history and category breakdown' },
  { name: 'Cash Flow Forecast Report', desc: '6-month projection with confidence bands' },
]

const history = [
  { id: 'RPT-2201', name: 'Financial Report - Jun 2026', date: '2026-07-01', format: 'PDF' },
  { id: 'RPT-2188', name: 'Risk Summary - Q2 2026', date: '2026-06-15', format: 'PDF' },
]

export default function Reports() {
  const [generating, setGenerating] = useState(false)

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Reports' }]}
        title="Reports"
        description="Generate and download reports on your business performance."
      />

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {reportTypes.map((r) => (
          <Card key={r.name} className="flex flex-col">
            <h3 className="font-semibold mb-1">{r.name}</h3>
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim flex-1">{r.desc}</p>
            <Button
              size="sm"
              icon={HiOutlineDocumentArrowDown}
              className="mt-4"
              onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 1200) }}
            >
              {generating ? 'Generating…' : 'Generate PDF'}
            </Button>
          </Card>
        ))}
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <h3 className="font-semibold mb-4">Report History</h3>
        </div>
        <Table>
          <Thead><Th>Report</Th><Th>Date</Th><Th>Format</Th><Th></Th></Thead>
          <tbody>
            {history.map((h) => (
              <Tr key={h.id}>
                <Td>{h.name}</Td><Td>{h.date}</Td><Td><Badge tone="info">{h.format}</Badge></Td>
                <Td><button className="text-primary-600 dark:text-primary-300 text-sm font-semibold">Download</button></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}
