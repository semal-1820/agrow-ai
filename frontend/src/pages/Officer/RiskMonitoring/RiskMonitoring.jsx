import { useEffect, useState } from 'react'
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'

import PageHeader from '../../../components/ui/PageHeader'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import {
  Table,
  Thead,
  Th,
  Tr,
  Td,
} from '../../../components/ui/Table'

import {
  getRiskMonitoring,
} from '../../../services/officerService'

const riskTone = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
}

export default function RiskMonitoring() {
  const [riskData, setRiskData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRiskData = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await getRiskMonitoring()

        setRiskData(
          Array.isArray(response)
            ? response
            : []
        )
      } catch (err) {
        console.error(
          'Risk monitoring loading error:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load risk monitoring data.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadRiskData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        Loading risk monitoring...
      </div>
    )
  }

  const totalAssessments =
    riskData.length

  const highRisk =
    riskData.filter(
      (risk) =>
        risk.level === 'High'
    ).length

  const mediumRisk =
    riskData.filter(
      (risk) =>
        risk.level === 'Medium'
    ).length

  const lowRisk =
    riskData.filter(
      (risk) =>
        risk.level === 'Low'
    ).length

  const averageRiskScore =
    totalAssessments > 0
      ? Math.round(
          riskData.reduce(
            (sum, risk) =>
              sum +
              (risk.score || 0),
            0
          ) / totalAssessments
        )
      : 0

  const highRiskPercentage =
    totalAssessments > 0
      ? Math.round(
          (highRisk /
            totalAssessments) *
            100
        )
      : 0

  const priorityList =
    riskData
      .filter(
        (risk) =>
          risk.level === 'High'
      )
      .sort(
        (a, b) =>
          (b.score || 0) -
          (a.score || 0)
      )

  return (
    <div>
      <PageHeader
        breadcrumb={[
          {
            label: 'Dashboard',
            href: '/officer/dashboard',
          },
          {
            label: 'Risk Monitoring',
          },
        ]}
        title="Risk Monitoring"
        description="Portfolio-wide enterprise risk monitoring and priority review."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="flex flex-col items-center justify-center text-center">
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim mb-2">
            Average Risk Score
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
                  value:
                    averageRiskScore,
                  fill: '#EF6C1C',
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
            {averageRiskScore}
            <span className="text-sm text-ink-dim dark:text-ink-dark-dim">
              /100
            </span>
          </p>

          <Badge
            tone={
              averageRiskScore >= 70
                ? 'high'
                : averageRiskScore >= 40
                  ? 'medium'
                  : 'low'
            }
            className="mt-16"
          >
            {averageRiskScore >= 70
              ? 'High Risk'
              : averageRiskScore >= 40
                ? 'Medium Risk'
                : 'Low Risk'}
          </Badge>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">
            Portfolio Risk Distribution
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-border dark:border-border-dark rounded-xl p-4">
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Total Assessments
              </p>

              <p className="text-2xl font-bold mt-2">
                {totalAssessments}
              </p>
            </div>

            <div className="border border-border dark:border-border-dark rounded-xl p-4">
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                High Risk
              </p>

              <p className="text-2xl font-bold mt-2">
                {highRisk}
              </p>

              <p className="text-xs text-ink-dim dark:text-ink-dark-dim mt-1">
                {highRiskPercentage}% of
                assessments
              </p>
            </div>

            <div className="border border-border dark:border-border-dark rounded-xl p-4">
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Medium Risk
              </p>

              <p className="text-2xl font-bold mt-2">
                {mediumRisk}
              </p>
            </div>

            <div className="border border-border dark:border-border-dark rounded-xl p-4">
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Low Risk
              </p>

              <p className="text-2xl font-bold mt-2">
                {lowRisk}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs mb-2">
              <span>Risk Distribution</span>

              <span>
                {totalAssessments}{' '}
                assessments
              </span>
            </div>

            <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10">
              {totalAssessments > 0 && (
                <>
                  <div
                    className="bg-red-500"
                    style={{
                      width: `${
                        (highRisk /
                          totalAssessments) *
                        100
                      }%`,
                    }}
                  />

                  <div
                    className="bg-yellow-500"
                    style={{
                      width: `${
                        (mediumRisk /
                          totalAssessments) *
                        100
                      }%`,
                    }}
                  />

                  <div
                    className="bg-green-500"
                    style={{
                      width: `${
                        (lowRisk /
                          totalAssessments) *
                        100
                      }%`,
                    }}
                  />
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-xs text-ink-dim dark:text-ink-dark-dim">
              <span>
                High: {highRisk}
              </span>

              <span>
                Medium: {mediumRisk}
              </span>

              <span>
                Low: {lowRisk}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0 flex items-center justify-between">
          <h3 className="font-semibold">
            Priority Review List
          </h3>

          <Badge tone="high">
            {priorityList.length} High
            Risk
          </Badge>
        </div>

        {priorityList.length > 0 ? (
          <Table>
            <Thead>
              <Th>Enterprise</Th>
              <Th>Type</Th>
              <Th>Village</Th>
              <Th>District</Th>
              <Th>Risk Score</Th>
              <Th>Risk Level</Th>
              <Th>Top Risk Factors</Th>
              <Th>Suggested Action</Th>
            </Thead>

            <tbody>
              {priorityList.map(
                (risk) => (
                  <Tr key={risk._id}>
                    <Td className="font-medium">
                      {risk.enterprise
                        ?.name ||
                        'Unknown'}
                    </Td>

                    <Td>
                      {risk.enterprise
                        ?.type || '-'}
                    </Td>

                    <Td>
                      {risk.enterprise
                        ?.village || '-'}
                    </Td>

                    <Td>
                      {risk.enterprise
                        ?.district || '-'}
                    </Td>

                    <Td>
                      <Badge tone="high">
                        {risk.score ||
                          0}
                        /100
                      </Badge>
                    </Td>

                    <Td>
                      <Badge
                        tone={
                          riskTone[
                            risk.level
                          ] ||
                          'neutral'
                        }
                      >
                        {risk.level ||
                          'Unknown'}
                      </Badge>
                    </Td>

                    <Td>
                      {risk.factors
                        ?.length > 0
                        ? risk.factors
                            .slice(0, 2)
                            .join(', ')
                        : 'No factors available'}
                    </Td>

                    <Td>
                      {risk.suggestions
                        ?.length > 0
                        ? risk
                            .suggestions[0]
                        : 'Review enterprise financials'}
                    </Td>
                  </Tr>
                )
              )}
            </tbody>
          </Table>
        ) : (
          <p className="text-sm text-center text-ink-dim dark:text-ink-dark-dim py-8">
            No high-risk enterprises
            currently require priority
            review.
          </p>
        )}
      </Card>
    </div>
  )
}