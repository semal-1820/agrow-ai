import { useEffect, useState } from 'react'
import PageHeader from '../../../components/ui/PageHeader'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'

import {
  HiOutlineSparkles,
  HiOutlineExclamationTriangle,
  HiOutlineLightBulb,
} from 'react-icons/hi2'

import {
  getAIInsights,
} from '../../../services/officerService'
import { PageSkeleton } from '../../../components/ui/Skeleton'

export default function AIInsights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getAIInsights()

        setData(response)
      } catch (err) {
        console.error(
          'AI insights loading error:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load AI insights.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadInsights()
  }, [])

  if (loading) {
    return <PageSkeleton />
  }

  const highRiskEnterprises =
    data?.highRiskEnterprises || []

  const sectorDistribution =
    data?.sectorDistribution || []

  const interventions =
    data?.interventions || []

  const portfolio =
    data?.portfolio || {
      totalEnterprises: 0,
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0,
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
            label: 'AI Insights Center',
          },
        ]}
        title="AI Insights Center"
        description="Data-driven risk insights and suggested interventions across your portfolio."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <Card>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
            Total Enterprises
          </p>

          <p className="text-2xl font-bold mt-2">
            {portfolio.totalEnterprises}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
            High Risk
          </p>

          <p className="text-2xl font-bold mt-2 text-red-600 dark:text-red-400">
            {portfolio.highRisk}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
            Medium Risk
          </p>

          <p className="text-2xl font-bold mt-2">
            {portfolio.mediumRisk}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
            Low Risk
          </p>

          <p className="text-2xl font-bold mt-2 text-primary-600 dark:text-primary-300">
            {portfolio.lowRisk}
          </p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineSparkles
              className="text-accent"
              size={18}
            />

            <h3 className="font-semibold">
              Portfolio Risk Overview
            </h3>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="border border-border dark:border-border-dark rounded-xl p-4">
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                High Risk
              </p>

              <p className="text-2xl font-bold mt-2">
                {portfolio.highRisk}
              </p>
            </div>

            <div className="border border-border dark:border-border-dark rounded-xl p-4">
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Medium Risk
              </p>

              <p className="text-2xl font-bold mt-2">
                {portfolio.mediumRisk}
              </p>
            </div>

            <div className="border border-border dark:border-border-dark rounded-xl p-4">
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Low Risk
              </p>

              <p className="text-2xl font-bold mt-2">
                {portfolio.lowRisk}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineExclamationTriangle
              className="text-red-500"
              size={18}
            />

            <h3 className="font-semibold">
              Top Risks Right Now
            </h3>
          </div>

          {highRiskEnterprises.length > 0 ? (
            <ul className="space-y-3">
              {highRiskEnterprises.map(
                (enterprise) => (
                  <li
                    key={enterprise.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {enterprise.name}
                      </p>

                      <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                        {enterprise.village ||
                          'Unknown village'}
                      </p>
                    </div>

                    <Badge tone="high">
                      {enterprise.riskScore}
                    </Badge>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No high-risk enterprises found.
            </p>
          )}
        </Card>
      </div>

      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineSparkles
            className="text-accent"
            size={18}
          />

          <h3 className="font-semibold">
            Suggested Interventions
          </h3>
        </div>

        {interventions.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {interventions.map(
              (intervention, index) => (
                <div
                  key={
                    intervention.title ||
                    index
                  }
                  className="border border-border dark:border-border-dark rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm">
                      {intervention.title}
                    </h4>

                    <Badge
                      tone={
                        intervention.impact ===
                        'High'
                          ? 'high'
                          : 'medium'
                      }
                    >
                      {intervention.impact}{' '}
                      impact
                    </Badge>
                  </div>

                  <p className="text-xs text-ink-dim dark:text-ink-dark-dim mb-2">
                    {intervention.target}
                  </p>

                  <p className="text-xs text-ink-dim dark:text-ink-dark-dim border-t border-border dark:border-border-dark pt-2">
                    {intervention.reason}
                  </p>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
            No intervention recommendations are currently available.
          </p>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineLightBulb
              className="text-accent"
              size={18}
            />

            <h3 className="font-semibold">
              Risk Summary
            </h3>
          </div>

          <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
            {data?.forecastSummary ||
              'No risk summary is currently available.'}
          </p>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">
            Sector Distribution
          </h3>

          {sectorDistribution.length > 0 ? (
            <div className="space-y-3">
              {sectorDistribution.map(
                (sector, index) => (
                  <div
                    key={
                      sector.name || index
                    }
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {sector.name ||
                        'Unknown Sector'}
                    </span>

                    <Badge tone="neutral">
                      {sector.value}
                    </Badge>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No sector distribution data available.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}