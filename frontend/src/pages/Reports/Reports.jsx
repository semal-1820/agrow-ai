import { useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import {
  Table,
  Thead,
  Th,
  Tr,
  Td,
} from '../../components/ui/Table'
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2'

import { getEnterprises } from '../../services/enterpriseService'
import {
  generateReport,
  getReports,
  downloadReport,
} from '../../services/reportService'

const reportTypes = [
  {
    name: 'Enterprise Financial Report',
    type: 'Financial',
    desc: 'Full income, expense and loan summary',
  },
  {
    name: 'Risk Summary Report',
    type: 'Risk',
    desc: 'Risk score, risk factors and suggested actions',
  },
  {
    name: 'Cash Flow Forecast Report',
    type: 'Forecast',
    desc: '6-month revenue, expense and cash flow projections',
  },
]

export default function Reports() {
  const [enterpriseId, setEnterpriseId] =
    useState(null)

  const [reports, setReports] =
    useState([])

  const [generatingType, setGeneratingType] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        const enterprises =
          await getEnterprises()

        if (
          enterprises &&
          enterprises.length > 0
        ) {
          setEnterpriseId(
            enterprises[0]._id
          )
        }

        const reportData =
          await getReports()

        setReports(
          Array.isArray(reportData)
            ? reportData
            : reportData.reports || []
        )
      } catch (err) {
        console.error(
          'Reports loading error:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load reports.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleGenerateReport = async (
    type
  ) => {
    if (!enterpriseId) {
      setError(
        'No enterprise found. Create an enterprise first.'
      )
      return
    }

    try {
      setGeneratingType(type)
      setError('')

      const newReport =
        await generateReport(
          enterpriseId,
          type
        )

      setReports((previous) => [
        newReport,
        ...previous,
      ])
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
      setGeneratingType(null)
    }
  }

  const handleDownload = async (
    report
  ) => {
    try {
      const blob =
        await downloadReport(
          report._id
        )

      const url =
        window.URL.createObjectURL(
          new Blob([blob])
        )

      const link =
        document.createElement('a')

      link.href = url

      link.setAttribute(
        'download',
        `${report.type || 'report'}-${report._id}.pdf`
      )

      document.body.appendChild(link)

      link.click()

      link.remove()

      window.URL.revokeObjectURL(
        url
      )
    } catch (err) {
      console.error(
        'Report download error:',
        err
      )

      setError(
        'Unable to download report.'
      )
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'

    return new Date(
      date
    ).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading reports...
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
            label: 'Reports',
          },
        ]}
        title="Reports"
        description="Generate and download reports on your business performance."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {reportTypes.map(
          (reportType) => (
            <Card
              key={reportType.type}
              className="flex flex-col"
            >
              <h3 className="font-semibold mb-1">
                {reportType.name}
              </h3>

              <p className="text-sm text-ink-dim dark:text-ink-dark-dim flex-1">
                {reportType.desc}
              </p>

              <Button
                size="sm"
                icon={
                  HiOutlineDocumentArrowDown
                }
                className="mt-4"
                disabled={
                  generatingType !== null
                }
                onClick={() =>
                  handleGenerateReport(
                    reportType.type
                  )
                }
              >
                {generatingType ===
                reportType.type
                  ? 'Generating...'
                  : 'Generate PDF'}
              </Button>
            </Card>
          )
        )}
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <h3 className="font-semibold mb-4">
            Report History
          </h3>
        </div>

        {reports.length > 0 ? (
          <Table>
            <Thead>
              <Th>Report</Th>
              <Th>Date</Th>
              <Th>Format</Th>
              <Th></Th>
            </Thead>

            <tbody>
              {reports.map(
                (report) => (
                  <Tr key={report._id}>
                    <Td>
                      {report.type ||
                        'Report'}{' '}
                      Report
                    </Td>

                    <Td>
                      {formatDate(
                        report.createdAt
                      )}
                    </Td>

                    <Td>
                      <Badge tone="info">
                        PDF
                      </Badge>
                    </Td>

                    <Td>
                      <button
                        onClick={() =>
                          handleDownload(
                            report
                          )
                        }
                        className="text-primary-600 dark:text-primary-300 text-sm font-semibold"
                      >
                        Download
                      </button>
                    </Td>
                  </Tr>
                )
              )}
            </tbody>
          </Table>
        ) : (
          <div className="p-5">
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No reports generated yet.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}