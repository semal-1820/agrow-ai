import { useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import {
  Table,
  Thead,
  Th,
  Tr,
  Td,
} from '../../components/ui/Table'
import { HiOutlinePencilSquare } from 'react-icons/hi2'

import { getEnterprises } from '../../services/enterpriseService'
import { getFinancialRecords } from '../../services/financialService'

const tabs = [
  'Overview',
  'Assets',
  'Liabilities',
  'Loans',
]

export default function MyEnterprise() {
  const [tab, setTab] = useState('Overview')
  const [enterprise, setEnterprise] = useState(null)
  const [financialRecords, setFinancialRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadEnterprise = async () => {
      try {
        setLoading(true)

        const enterprises = await getEnterprises()

        if (!enterprises || enterprises.length === 0) {
          setError('No enterprise found.')
          return
        }

        const selectedEnterprise = enterprises[0]

        setEnterprise(selectedEnterprise)

        const records = await getFinancialRecords()

        const enterpriseRecords = records.filter(
          (record) =>
            record.enterprise === selectedEnterprise._id ||
            record.enterprise?._id === selectedEnterprise._id
        )

        setFinancialRecords(enterpriseRecords)
      } catch (err) {
        console.error(
          'Enterprise loading error:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load enterprise.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadEnterprise()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        Loading enterprise...
      </div>
    )
  }

  if (!enterprise) {
    return (
      <div>
        <PageHeader
          title="Business Profile"
          description="Manage your enterprise details."
        />

        <Card>
          <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
            {error || 'No enterprise found.'}
          </p>
        </Card>
      </div>
    )
  }

  const latestRecord =
    financialRecords.length > 0
      ? financialRecords[
          financialRecords.length - 1
        ]
      : null

  return (
    <div>
      <PageHeader
        breadcrumb={[
          {
            label: 'Dashboard',
            href: '/app/dashboard',
          },
          {
            label: 'My Enterprise',
          },
        ]}
        title="Business Profile"
        description="View and manage your enterprise details and financial position."
        actions={
          <Button
            icon={HiOutlinePencilSquare}
            variant="outline"
          >
            Edit Profile
          </Button>
        }
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      <Card className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-full md:w-40 h-28 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 text-xs font-medium shrink-0">
          Enterprise
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold">
              {enterprise.name}
            </h2>

            <Badge tone="low">
              Registered
            </Badge>
          </div>

          <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
            {enterprise.type || 'N/A'}
            {enterprise.village
              ? ` · ${enterprise.village}`
              : ''}
            {enterprise.district
              ? `, ${enterprise.district}`
              : ''}
            {enterprise.state
              ? `, ${enterprise.state}`
              : ''}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
            <div>
              <p className="text-ink-dim dark:text-ink-dark-dim text-xs">
                Business ID
              </p>

              <p className="font-semibold break-all">
                {enterprise._id}
              </p>
            </div>

            <div>
              <p className="text-ink-dim dark:text-ink-dark-dim text-xs">
                Employees
              </p>

              <p className="font-semibold">
                {enterprise.employees ?? 0}
              </p>
            </div>

            <div>
              <p className="text-ink-dim dark:text-ink-dark-dim text-xs">
                Annual Income
              </p>

              <p className="font-semibold">
                ₹
                {(
                  enterprise.annualIncome || 0
                ).toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <p className="text-ink-dim dark:text-ink-dark-dim text-xs">
                Financial Records
              </p>

              <p className="font-semibold">
                {financialRecords.length}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-1 border-b border-border dark:border-border-dark mb-5 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === item
                ? 'border-primary-500 text-primary-600 dark:text-primary-300'
                : 'border-transparent text-ink-dim dark:text-ink-dark-dim'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <Card>
          <h3 className="font-semibold mb-4">
            Enterprise Overview
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Enterprise Name
              </p>

              <p className="font-semibold mt-1">
                {enterprise.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Enterprise Type
              </p>

              <p className="font-semibold mt-1">
                {enterprise.type || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Village
              </p>

              <p className="font-semibold mt-1">
                {enterprise.village || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                District
              </p>

              <p className="font-semibold mt-1">
                {enterprise.district || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                State
              </p>

              <p className="font-semibold mt-1">
                {enterprise.state || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Annual Income
              </p>

              <p className="font-semibold mt-1">
                ₹
                {(
                  enterprise.annualIncome || 0
                ).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {tab === 'Assets' && (
        <Table>
          <Thead>
            <Th>Month</Th>
            <Th>Total Assets</Th>
          </Thead>

          <tbody>
            {financialRecords.map(
              (record) => (
                <Tr key={record._id}>
                  <Td>
                    {record.month || 'N/A'}
                  </Td>

                  <Td>
                    ₹
                    {(
                      record.assets || 0
                    ).toLocaleString('en-IN')}
                  </Td>
                </Tr>
              )
            )}
          </tbody>
        </Table>
      )}

      {tab === 'Liabilities' && (
        <Table>
          <Thead>
            <Th>Month</Th>
            <Th>Total Liabilities</Th>
          </Thead>

          <tbody>
            {financialRecords.map(
              (record) => (
                <Tr key={record._id}>
                  <Td>
                    {record.month || 'N/A'}
                  </Td>

                  <Td>
                    ₹
                    {(
                      record.liabilities || 0
                    ).toLocaleString('en-IN')}
                  </Td>
                </Tr>
              )
            )}
          </tbody>
        </Table>
      )}

      {tab === 'Loans' && (
        <Card>
          {latestRecord ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                  Latest Monthly EMI
                </p>

                <p className="text-xl font-bold mt-1">
                  ₹
                  {(
                    latestRecord.loanEMI || 0
                  ).toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                  Total Liabilities
                </p>

                <p className="text-xl font-bold mt-1">
                  ₹
                  {(
                    latestRecord.liabilities ||
                    0
                  ).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No financial records available.
            </p>
          )}
        </Card>
      )}
    </div>
  )
}