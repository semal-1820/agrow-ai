export const cashFlowForecast = [
  { month: 'Aug', actual: null, forecast: 82400, upper: 91000, lower: 73800 },
  { month: 'Sep', actual: null, forecast: 68500, upper: 79200, lower: 57800 },
  { month: 'Oct', actual: null, forecast: 74200, upper: 84600, lower: 63800 },
  { month: 'Nov', actual: null, forecast: 88900, upper: 99400, lower: 78400 },
  { month: 'Dec', actual: null, forecast: 94200, upper: 105800, lower: 82600 },
  { month: 'Jan', actual: null, forecast: 91600, upper: 103200, lower: 80000 },
]

export const forecastHistory = [
  { month: 'Feb', actual: 72400, forecast: 70100 },
  { month: 'Mar', actual: 75800, forecast: 77200 },
  { month: 'Apr', actual: 69200, forecast: 71500 },
  { month: 'May', actual: 78650, forecast: 76300 },
  { month: 'Jun', actual: 81200, forecast: 79800 },
  { month: 'Jul', actual: 78650, forecast: 80100 },
]

export const forecastMeta = {
  horizonMonths: 6,
  confidence: 92,
  model: 'Seasonal regression (weather + price + repayment cycle)',
  lastTrained: '2026-07-10',
  keyDrivers: [
    { factor: 'Monsoon / feed cost cycle', impact: 'High' },
    { factor: 'Milk procurement price trend', impact: 'Medium' },
    { factor: 'Loan EMI schedule', impact: 'High' },
    { factor: 'Festive demand (Oct-Nov)', impact: 'Medium' },
  ],
}
