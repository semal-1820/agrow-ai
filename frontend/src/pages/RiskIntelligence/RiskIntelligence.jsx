import { RadialBarChart, RadialBar, PolarAngleAxis, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { riskOverview, sectorRiskModels } from '../../data/risk'
import { enterprise } from '../../data/enterprise'

const toneFor = (level) => (level === 'Low' ? 'low' : level === 'High' ? 'high' : 'medium')

export default function RiskIntelligence() {
  const sectorKey = enterprise.type.toLowerCase().includes('dairy') ? 'dairy' : 'crop'
  const sectorModel = sectorRiskModels[sectorKey]

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Risk Intelligence' }]}
        title="Risk Intelligence"
        description="Overall risk score plus a breakdown by category, weighted for your business sector."
      />

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="flex flex-col items-center justify-center text-center">
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim mb-2">Overall Risk Score</p>
          <ResponsiveContainer width={160} height={160}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: riskOverview.score, fill: '#FFC107' }]} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={20} background />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-2xl font-bold -mt-16">{riskOverview.score}<span className="text-sm text-ink-dim dark:text-ink-dark-dim">/100</span></p>
          <Badge tone="medium" className="mt-16">{riskOverview.level}</Badge>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Risk Breakdown</h3>
          <div className="space-y-3">
            {riskOverview.breakdown.map((r) => (
              <div key={r.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{r.name}</span>
                  <span className="font-semibold">{r.score}/100</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-primary-500" style={{ width: `${r.score}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border dark:border-border-dark">
            <div><p className="text-xs text-ink-dim dark:text-ink-dark-dim">Default Probability</p><p className="font-semibold">{riskOverview.defaultProbability}% · Low</p></div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold mb-1">Why this score? (Explainable AI)</h3>
        <p className="text-sm text-ink-dim dark:text-ink-dark-dim">{riskOverview.explanation}</p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-1">Sector Model: {sectorModel.label}</h3>
          <p className="text-xs text-ink-dim dark:text-ink-dark-dim mb-4">Your risk score is weighted for factors specific to this sector.</p>
          <div className="space-y-3">
            {sectorModel.factors.map((f) => (
              <div key={f.name} className="flex items-center justify-between text-sm">
                <span>{f.name}</span>
                <span className="font-semibold text-primary-600 dark:text-primary-300">{f.weight}% weight</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold mb-4">Risk Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={riskOverview.timeline}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBF0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={30} domain={[0, 100]} />
              <Tooltip />
              <Line dataKey="score" stroke="#FFC107" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
