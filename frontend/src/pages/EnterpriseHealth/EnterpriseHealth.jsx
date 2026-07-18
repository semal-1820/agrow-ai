import { useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { HiOutlineLightBulb } from 'react-icons/hi2'

import { getEnterprises } from '../../services/enterpriseService'
import { getEnterpriseHealth } from '../../services/healthService'

export default function EnterpriseHealth() {
  const [enterprise, setEnterprise] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadHealth = async () => {
      try {
        setLoading(true)

        const enterprises = await getEnterprises()

        if (!enterprises || enterprises.length === 0) {
          setError(
            'No enterprise found. Create an enterprise first.'
          )
          return
        }

        const selectedEnterprise = enterprises[0]

        setEnterprise(selectedEnterprise)

        const healthData = await getEnterpriseHealth(
          selectedEnterprise._id
        )

        setHealth(healthData)
      } catch (err) {
        console.error(
          'Enterprise health loading error:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to calculate enterprise health.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadHealth()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        Loading enterprise health...
      </div>
    )
  }

  const healthScore =
    health?.healthScore ??
    health?.score ??
    0

  const healthStatus =
    health?.status ||
    health?.label ||
    'Not Available'

  const breakdown = [
    {
      name: 'Liquidity',
      score:
        health?.liquidityScore ??
        health?.liquidity ??
        0,
    },
    {
      name: 'Profitability',
      score:
        health?.profitabilityScore ??
        health?.profitability ??
        0,
    },
    {
      name: 'Debt Ratio',
      score:
        health?.debtScore ??
        health?.debtRatioScore ??
        0,
    },
    {
      name: 'Revenue Growth',
      score:
        health?.revenueGrowthScore ??
        health?.revenueGrowth ??
        0,
    },
    {
      name: 'Expense Control',
      score:
        health?.expenseControlScore ??
        health?.expenseControl ??
        0,
    },
    {
      name: 'Cash Reserves',
      score:
        health?.cashReserveScore ??
        health?.cashReserves ??
        0,
    },
  ]

  const recommendations =
    health?.recommendations ||
    health?.suggestions ||
    []

  const getHealthTone = () => {
    if (healthScore >= 75) return 'low'
    if (healthScore >= 50) return 'medium'
    return 'high'
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
            label: 'Enterprise Health',
          },
        ]}
        title="Enterprise Health"
        description="A composite score of how sustainably your business is running."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="flex flex-col items-center justify-center text-center">
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim mb-2">
            Health Score
          </p>

          <div className="w-28 h-28 rounded-full border-8 border-primary-500 flex items-center justify-center">
            <span className="text-3xl font-bold">
              {Math.round(healthScore)}
            </span>
          </div>

          <div className="mt-3">
            <Badge tone={getHealthTone()}>
              {healthStatus}
            </Badge>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">
            Score Breakdown
          </h3>

          <div className="grid sm:grid-cols-2 gap-3">
            {breakdown.map((item) => (
              <div
                key={item.name}
                className="border border-border dark:border-border-dark rounded-lg px-3 py-3"
              >
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>{item.name}</span>

                  <span className="font-semibold">
                    {Math.round(item.score)}/100
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-primary-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, item.score)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">
            Enterprise Information
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-dim dark:text-ink-dark-dim">
                Enterprise
              </span>

              <span className="font-semibold">
                {enterprise?.name || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-ink-dim dark:text-ink-dark-dim">
                Type
              </span>

              <span className="font-semibold">
                {enterprise?.type || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-ink-dim dark:text-ink-dark-dim">
                District
              </span>

              <span className="font-semibold">
                {enterprise?.district || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-ink-dim dark:text-ink-dark-dim">
                Overall Status
              </span>

              <Badge tone={getHealthTone()}>
                {healthStatus}
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineLightBulb
              className="text-accent"
              size={20}
            />

            <h3 className="font-semibold">
              Recommendations
            </h3>
          </div>

          {recommendations.length > 0 ? (
            <ul className="space-y-3">
              {recommendations.map(
                (recommendation, index) => (
                  <li
                    key={index}
                    className="text-sm text-ink-dim dark:text-ink-dark-dim border-l-2 border-primary-500 pl-3"
                  >
                    {recommendation}
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No recommendations available.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}