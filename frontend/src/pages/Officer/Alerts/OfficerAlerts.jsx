import { useEffect, useState } from 'react'
import PageHeader from '../../../components/ui/PageHeader'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { HiOutlineExclamationTriangle } from 'react-icons/hi2'
import { getOfficerAlerts } from '../../../services/officerService'

export default function OfficerAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getOfficerAlerts()

        setAlerts(
          Array.isArray(data)
            ? data
            : []
        )
      } catch (err) {
        console.error(
          'Officer alerts loading error:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load alerts.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        Loading alerts...
      </div>
    )
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
            label: 'Alerts',
          },
        ]}
        title="AI Alerts"
        description="System-generated alerts across your enterprise portfolio."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <HiOutlineExclamationTriangle
                  size={18}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">
                      {alert.title}
                    </h3>

                    {alert.enterprise && (
                      <p className="text-xs text-ink-dim dark:text-ink-dark-dim mt-1">
                        {alert.enterprise.village ||
                          'Unknown village'}

                        {alert.enterprise.district
                          ? `, ${alert.enterprise.district}`
                          : ''}
                      </p>
                    )}
                  </div>

                  <Badge
                    tone={
                      alert.severity ||
                      'neutral'
                    }
                  >
                    {alert.severity ||
                      'unknown'}
                  </Badge>
                </div>

                {alert.factors?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold mb-1">
                      Risk Factors
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {alert.factors.map(
                        (factor, index) => (
                          <Badge
                            key={index}
                            tone="neutral"
                          >
                            {factor}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

                {alert.suggestions?.length >
                  0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold mb-1">
                      Recommended Action
                    </p>

                    <ul className="space-y-1">
                      {alert.suggestions.map(
                        (
                          suggestion,
                          index
                        ) => (
                          <li
                            key={index}
                            className="text-xs text-ink-dim dark:text-ink-dark-dim"
                          >
                            {suggestion}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-ink-dim dark:text-ink-dark-dim mt-3">
                  {alert.date
                    ? new Date(
                        alert.date
                      ).toLocaleDateString(
                        'en-IN'
                      )
                    : '-'}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-center text-ink-dim dark:text-ink-dark-dim py-6">
            No alerts are currently available.
          </p>
        </Card>
      )}
    </div>
  )
}