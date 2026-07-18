import { useState } from 'react'
import PageHeader from '../../../components/ui/PageHeader'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2'

import {
  getPortfolioRiskReport,
  getVillagePerformanceReport,
  getDefaultPredictionReport,
} from '../../../services/officerService'

const reportTypes = [
  {
    id: 'portfolio-risk',
    name: 'Portfolio Risk Summary',
    desc: 'Risk distribution across all assigned enterprises',
  },
  {
    id: 'village-performance',
    name: 'Village Performance Report',
    desc: 'Turnover and performance by village',
  },
  {
    id: 'default-prediction',
    name: 'Default Prediction Report',
    desc: 'High-risk enterprises flagged for priority review',
  },
]

export default function OfficerReports() {
  const [generating, setGenerating] = useState(null)
  const [error, setError] = useState('')

  const fetchReport = async (reportId) => {
    switch (reportId) {
      case 'portfolio-risk':
        return await getPortfolioRiskReport()

      case 'village-performance':
        return await getVillagePerformanceReport()

      case 'default-prediction':
        return await getDefaultPredictionReport()

      default:
        throw new Error('Invalid report type')
    }
  }

  const handleGenerateReport = async (report) => {
    try {
      setGenerating(report.id)
      setError('')

      const data = await fetchReport(report.id)

      const reportContent = JSON.stringify(
        data,
        null,
        2
      )

      const blob = new Blob(
        [reportContent],
        {
          type: 'application/json',
        }
      )

      const url =
        window.URL.createObjectURL(blob)

      const link =
        document.createElement('a')

      link.href = url

      link.download = `${report.id}-${Date.now()}.json`

      document.body.appendChild(link)

      link.click()

      document.body.removeChild(link)

      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(
        'Report generation error:',
        err
      )

      setError(
        err.response?.data?.message ||
          'Unable to generate report.'
      )
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[
          {
            label: 'Dashboard',
            href: '/officer/dashboard',
          },
          {
            label: 'Reports',
          },
        ]}
        title="Reports"
        description="Generate portfolio and village-level reports."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className="flex flex-col"
          >
            <h3 className="font-semibold mb-1">
              {report.name}
            </h3>

            <p className="text-sm text-ink-dim dark:text-ink-dark-dim flex-1">
              {report.desc}
            </p>

            <Button
              size="sm"
              icon={HiOutlineDocumentArrowDown}
              className="mt-4"
              disabled={
                generating === report.id
              }
              onClick={() =>
                handleGenerateReport(report)
              }
            >
              {generating === report.id
                ? 'Generating...'
                : 'Generate Report'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}