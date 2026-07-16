export const riskOverview = {
  score: 62,
  level: 'Medium Risk',
  defaultProbability: 12.4,
  breakdown: [
    { name: 'Financial Risk', score: 58, level: 'Medium' },
    { name: 'Climate Risk', score: 65, level: 'Medium' },
    { name: 'Market Risk', score: 48, level: 'Low' },
    { name: 'Loan Risk', score: 55, level: 'Medium' },
  ],
  timeline: [
    { month: 'Feb', score: 48 },
    { month: 'Mar', score: 51 },
    { month: 'Apr', score: 57 },
    { month: 'May', score: 54 },
    { month: 'Jun', score: 59 },
    { month: 'Jul', score: 62 },
  ],
  explanation:
    'Risk is trending up mainly due to rising feed costs ahead of monsoon and two upcoming EMI payments in the next 30 days. Milk procurement prices remain stable, which is holding overall risk in the medium band rather than high.',
}

// Sector-specific risk models — each sector weighs different factors
export const sectorRiskModels = {
  dairy: {
    label: 'Dairy Farming',
    factors: [
      { name: 'Feed Cost Volatility', weight: 30 },
      { name: 'Milk Procurement Price', weight: 25 },
      { name: 'Monsoon / Climate', weight: 25 },
      { name: 'Loan Burden', weight: 20 },
    ],
  },
  crop: {
    label: 'Crop Farming',
    factors: [
      { name: 'Rainfall Pattern', weight: 35 },
      { name: 'Commodity Price', weight: 25 },
      { name: 'Harvest Season Timing', weight: 20 },
      { name: 'Input Cost', weight: 20 },
    ],
  },
  handicraft: {
    label: 'Handicrafts / Rural Retail',
    factors: [
      { name: 'Seasonal Demand', weight: 35 },
      { name: 'Sales Trend', weight: 25 },
      { name: 'Inventory Turnover', weight: 20 },
      { name: 'Raw Material Price', weight: 20 },
    ],
  },
}
