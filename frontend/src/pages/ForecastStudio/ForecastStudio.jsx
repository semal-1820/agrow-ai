import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Table, Thead, Th, Tr, Td } from '../../components/ui/Table'
import { cashFlowForecast, forecastMeta } from '../../data/forecast'

export default function ForecastStudio() {
  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Forecast Studio' }]}
        title="Cash Flow Forecast"
        description={`AI-projected cash flow for the next ${forecastMeta.horizonMonths} months, with a confidence band based on income, weather and market signals.`}
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card><p className="text-xs text-ink-dim dark:text-ink-dark-dim">Forecast Confidence</p><p className="text-2xl font-bold mt-1">{forecastMeta.confidence}%</p></Card>
        <Card><p className="text-xs text-ink-dim dark:text-ink-dark-dim">Model</p><p className="text-sm font-semibold mt-2">{forecastMeta.model}</p></Card>
        <Card><p className="text-xs text-ink-dim dark:text-ink-dark-dim">Last Trained</p><p className="text-sm font-semibold mt-2">{forecastMeta.lastTrained}</p></Card>
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold mb-4">6-Month Projection with Confidence Band</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={cashFlowForecast}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBF0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
            <Tooltip />
            <Legend />
            <Area dataKey="upper" stroke="none" fill="#2E7D32" fillOpacity={0.08} name="Upper bound" />
            <Area dataKey="lower" stroke="none" fill="#F8FAFC" fillOpacity={1} name="Lower bound" />
            <Line dataKey="forecast" stroke="#2E7D32" strokeWidth={2.5} dot={{ r: 3 }} name="Forecast" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-3">Projection Table</h3>
          <Table>
            <Thead><Th>Month</Th><Th>Forecast</Th><Th>Range</Th></Thead>
            <tbody>
              {cashFlowForecast.map((f) => (
                <Tr key={f.month}>
                  <Td>{f.month}</Td>
                  <Td className="font-semibold">₹{f.forecast.toLocaleString('en-IN')}</Td>
                  <Td className="text-ink-dim dark:text-ink-dark-dim">₹{f.lower.toLocaleString('en-IN')} – ₹{f.upper.toLocaleString('en-IN')}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Key Drivers</h3>
          <ul className="space-y-3">
            {forecastMeta.keyDrivers.map((d) => (
              <li key={d.factor} className="flex items-center justify-between text-sm">
                <span>{d.factor}</span>
                <Badge tone={d.impact === 'High' ? 'high' : 'medium'}>{d.impact} impact</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
