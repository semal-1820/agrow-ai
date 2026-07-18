import { useEffect, useState } from 'react'
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'

import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

import { getEnterprises } from '../../services/enterpriseService'
import {
  generateRiskAssessment,
  getRiskAssessment,
} from '../../services/riskService'

const toneFor = (level) => {
  if (level === 'Low') return 'low'
  if (level === 'High') return 'high'
  return 'medium'
}

export default function RiskIntelligence() {
  const [enterprise, setEnterprise] = useState(null)
  const [risk, setRisk] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRisk = async () => {
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

        try {
          const riskData =
            await getRiskAssessment(
              selectedEnterprise._id
            )

          setRisk(riskData)
        } catch (err) {
          console.log(
            'No existing risk assessment found.'
          )
        }
      } catch (err) {
        console.error(
          'Risk loading error:',
          err
        )

        setError(
          'Unable to load risk information.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadRisk()
  }, [])

  const handleGenerateRisk = async () => {
    if (!enterprise?._id) {
      return
    }

    try {
      setGenerating(true)
      setError('')

      const data =
        await generateRiskAssessment(
          enterprise._id
        )

      setRisk(data)
    } catch (err) {
      console.error(
        'Risk generation error:',
        err
      )

      setError(
        err.response?.data?.message ||
          'Unable to generate risk assessment.'
      )
    } finally {
      setGenerating(false)
    }
  }

  const score = risk?.score || 0
  const level = risk?.level || 'Not Assessed'

  if (loading) {
    return (
      <div className="p-6">
        Loading risk intelligence...
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
            label: 'Risk Intelligence',
          },
        ]}
        title="Risk Intelligence"
        description="Explainable financial risk assessment based on your enterprise financial records."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      <div className="flex justify-end mb-4">
        <Button
          onClick={handleGenerateRisk}
          disabled={
            generating || !enterprise
          }
        >
          {generating
            ? 'Assessing Risk...'
            : risk
              ? 'Reassess Risk'
              : 'Generate Risk Assessment'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="flex flex-col items-center justify-center text-center">
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim mb-2">
            Overall Risk Score
          </p>

          <ResponsiveContainer
            width={160}
            height={160}
          >
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={[
                {
                  value: score,
                  fill: '#FFC107',
                },
              ]}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                tick={false}
              />

              <RadialBar
                dataKey="value"
                cornerRadius={20}
                background
              />
            </RadialBarChart>
          </ResponsiveContainer>

          <p className="text-2xl font-bold -mt-16">
            {score}

            <span className="text-sm text-ink-dim dark:text-ink-dark-dim">
              /100
            </span>
          </p>

          <Badge
            tone={toneFor(level)}
            className="mt-16"
          >
            {level}
          </Badge>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">
            Risk Factors
          </h3>

          {risk?.factors?.length > 0 ? (
            <div className="space-y-3">
              {risk.factors.map(
                (factor, index) => (
                  <div
                    key={`${factor}-${index}`}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-white/5"
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 shrink-0" />

                    <span className="text-sm">
                      {factor}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              Generate a risk assessment to
              identify financial risk factors.
            </p>
          )}
        </Card>
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold mb-1">
          Why this score? (Explainable AI)
        </h3>

        <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
          {risk?.factors?.length > 0
            ? `The ${level.toLowerCase()} risk score of ${score}/100 is based on factors including ${risk.factors.join(
                ', '
              )}.`
            : 'Generate a risk assessment to receive an explanation based on your financial records.'}
        </p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-1">
            Suggested Actions
          </h3>

          <p className="text-xs text-ink-dim dark:text-ink-dark-dim mb-4">
            Recommended actions based on the
            identified financial risks.
          </p>

          {risk?.suggestions?.length > 0 ? (
            <ul className="space-y-3">
              {risk.suggestions.map(
                (suggestion, index) => (
                  <li
                    key={`${suggestion}-${index}`}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />

                    <span>
                      {suggestion}
                    </span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No recommendations available yet.
            </p>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">
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
                Sector
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
                Risk Level
              </span>

              <Badge tone={toneFor(level)}>
                {level}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}