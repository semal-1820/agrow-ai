import { useEffect, useState } from 'react'
import PageHeader from '../../../components/ui/PageHeader'
import StatCard from '../../../components/ui/StatCard'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { Table, Thead, Th, Tr, Td } from '../../../components/ui/Table'
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineBanknotes,
} from 'react-icons/hi2'

import {
  getSchemeApplications,
  updateSchemeApplicationStatus,
  getSchemePerformance,
  getBeneficiaries,
} from '../../../services/schemeManagementService'
import { PageSkeleton } from '../../../components/ui/Skeleton'

const statusTone = {
  Pending: 'medium',
  Approved: 'low',
  Rejected: 'critical',
}

const tabs = [
  'Applications',
  'Scheme Performance',
  'Beneficiaries',
]

export default function SchemeManagement() {
  const [tab, setTab] = useState('Applications')
  const [statusFilter, setStatusFilter] = useState('All')

  const [schemeApplications, setSchemeApplications] = useState([])
  const [schemePerformance, setSchemePerformance] = useState([])
  const [beneficiaries, setBeneficiaries] = useState([])

  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        applicationsData,
        performanceData,
        beneficiariesData,
      ] = await Promise.all([
        getSchemeApplications(),
        getSchemePerformance(),
        getBeneficiaries(),
      ])

      setSchemeApplications(
        Array.isArray(applicationsData)
          ? applicationsData
          : []
      )

      setSchemePerformance(
        Array.isArray(performanceData)
          ? performanceData
          : []
      )

      setBeneficiaries(
        Array.isArray(beneficiariesData)
          ? beneficiariesData
          : []
      )
    } catch (err) {
      console.error(
        'Scheme management loading error:',
        err
      )

      setError(
        err.response?.data?.message ||
          'Unable to load scheme management data.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusUpdate = async (
    applicationId,
    status
  ) => {
    try {
      setUpdatingId(applicationId)
      setError('')

      await updateSchemeApplicationStatus(
        applicationId,
        status
      )

      await loadData()
    } catch (err) {
      console.error(
        'Application status update error:',
        err
      )

      setError(
        err.response?.data?.message ||
          'Unable to update application status.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const totalPending = schemeApplications.filter(
    (application) =>
      application.status === 'Pending'
  ).length

  const totalApproved = schemeApplications.filter(
    (application) =>
      application.status === 'Approved'
  ).length

  const totalRejected = schemeApplications.filter(
    (application) =>
      application.status === 'Rejected'
  ).length

  const totalDisbursed = schemePerformance.reduce(
    (sum, scheme) =>
      sum + Number(scheme.disbursed || 0),
    0
  )

  const filteredApps =
    statusFilter === 'All'
      ? schemeApplications
      : schemeApplications.filter(
          (application) =>
            application.status === statusFilter
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
            href: '/officer/dashboard',
          },
          {
            label: 'Scheme Management',
          },
        ]}
        title="Government Scheme Management"
        description="Review applications, track scheme performance and disbursed beneficiaries."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Pending Review"
          value={totalPending}
          icon={HiOutlineClock}
        />

        <StatCard
          label="Approved"
          value={totalApproved}
          icon={HiOutlineClipboardDocumentCheck}
        />

        <StatCard
          label="Rejected"
          value={totalRejected}
          icon={HiOutlineXCircle}
        />

        <StatCard
          label="Total Disbursed"
          value={`₹${(
            totalDisbursed / 10000000
          ).toFixed(1)} Cr`}
          icon={HiOutlineBanknotes}
        />
      </div>

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

      {tab === 'Applications' && (
        <>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {[
              'All',
              'Pending',
              'Approved',
              'Rejected',
            ].map((status) => (
              <button
                key={status}
                onClick={() =>
                  setStatusFilter(status)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-border dark:border-border-dark text-ink-dim dark:text-ink-dark-dim'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <Card padded={false}>
            {filteredApps.length > 0 ? (
              <Table>
                <Thead>
                  <Th>App ID</Th>
                  <Th>Applicant</Th>
                  <Th>Enterprise</Th>
                  <Th>Scheme</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </Thead>

                <tbody>
                  {filteredApps.map(
                    (application) => (
                      <Tr key={application._id}>
                        <Td>
                          {application._id}
                        </Td>

                        <Td className="font-medium">
                          {application
                            .applicant?.name ||
                            'Unknown'}
                        </Td>

                        <Td>
                          {application
                            .enterprise?.name ||
                            'Unknown'}
                        </Td>

                        <Td>
                          {application
                            .scheme?.name ||
                            'Unknown'}
                        </Td>

                        <Td>
                          ₹
                          {Number(
                            application.amount ||
                              0
                          ).toLocaleString(
                            'en-IN'
                          )}
                        </Td>

                        <Td>
                          <Badge
                            tone={
                              statusTone[
                                application
                                  .status
                              ] ||
                              'neutral'
                            }
                          >
                            {application.status}
                          </Badge>
                        </Td>

                        <Td>
                          {application.status ===
                            'Pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={
                                  updatingId ===
                                  application._id
                                }
                                onClick={() =>
                                  handleStatusUpdate(
                                    application._id,
                                    'Approved'
                                  )
                                }
                              >
                                {updatingId ===
                                application._id
                                  ? 'Updating...'
                                  : 'Approve'}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={
                                  updatingId ===
                                  application._id
                                }
                                onClick={() =>
                                  handleStatusUpdate(
                                    application._id,
                                    'Rejected'
                                  )
                                }
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </Td>
                      </Tr>
                    )
                  )}
                </tbody>
              </Table>
            ) : (
              <p className="text-sm text-center text-ink-dim dark:text-ink-dark-dim py-8">
                No scheme applications found.
              </p>
            )}
          </Card>
        </>
      )}

      {tab === 'Scheme Performance' && (
        <Card padded={false}>
          {schemePerformance.length > 0 ? (
            <Table>
              <Thead>
                <Th>Scheme</Th>
                <Th>Applications</Th>
                <Th>Approved</Th>
                <Th>Rejected</Th>
                <Th>Pending</Th>
                <Th>Disbursed</Th>
              </Thead>

              <tbody>
                {schemePerformance.map(
                  (scheme, index) => (
                    <Tr
                      key={
                        scheme.schemeId ||
                        scheme.name ||
                        index
                      }
                    >
                      <Td className="font-medium">
                        {scheme.name}
                      </Td>

                      <Td>
                        {scheme.applications}
                      </Td>

                      <Td className="text-primary-600 dark:text-primary-300 font-semibold">
                        {scheme.approved}
                      </Td>

                      <Td className="text-red-600 dark:text-red-400 font-semibold">
                        {scheme.rejected}
                      </Td>

                      <Td>
                        {scheme.pending}
                      </Td>

                      <Td>
                        ₹
                        {(
                          Number(
                            scheme.disbursed ||
                              0
                          ) / 10000000
                        ).toFixed(2)}{' '}
                        Cr
                      </Td>
                    </Tr>
                  )
                )}
              </tbody>
            </Table>
          ) : (
            <p className="text-sm text-center text-ink-dim dark:text-ink-dark-dim py-8">
              No scheme performance data available.
            </p>
          )}
        </Card>
      )}

      {tab === 'Beneficiaries' && (
        <Card padded={false}>
          {beneficiaries.length > 0 ? (
            <Table>
              <Thead>
                <Th>Beneficiary</Th>
                <Th>Enterprise</Th>
                <Th>Scheme</Th>
                <Th>Amount Received</Th>
                <Th>Disbursed On</Th>
              </Thead>

              <tbody>
                {beneficiaries.map(
                  (beneficiary) => (
                    <Tr key={beneficiary._id}>
                      <Td className="font-medium">
                        {beneficiary
                          .applicant?.name ||
                          'Unknown'}
                      </Td>

                      <Td>
                        {beneficiary
                          .enterprise?.name ||
                          'Unknown'}
                      </Td>

                      <Td>
                        {beneficiary
                          .scheme?.name ||
                          'Unknown'}
                      </Td>

                      <Td>
                        ₹
                        {Number(
                          beneficiary.disbursedAmount ||
                            0
                        ).toLocaleString(
                          'en-IN'
                        )}
                      </Td>

                      <Td>
                        {beneficiary.disbursedOn
                          ? new Date(
                              beneficiary.disbursedOn
                            ).toLocaleDateString(
                              'en-IN'
                            )
                          : '-'}
                      </Td>
                    </Tr>
                  )
                )}
              </tbody>
            </Table>
          ) : (
            <p className="text-sm text-center text-ink-dim dark:text-ink-dark-dim py-8">
              No beneficiaries found.
            </p>
          )}
        </Card>
      )}
    </div>
  )
}