// Officer-side detail records, keyed by enterprise ID.
// Matches the IDs used in enterpriseRegistry (see officer.js).

export const enterpriseDetails = {
  'ENT-000124': {
    id: 'ENT-000124',
    name: 'Shree Ram Dairy Farm',
    owner: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    sector: 'Dairy Farming',
    village: 'Rampur',
    district: 'Sehore',
    established: 2018,
    status: 'Active',
    healthScore: 85,
    riskScore: 62,
    riskLevel: 'Medium',
    annualTurnover: 2480000,
    description: 'Engaged in dairy farming and milk production with 15+ cows and daily supply to the local dairy collection center.',
    financials: {
      monthly: [
        { month: 'Feb', income: 72400, expenses: 41200 },
        { month: 'Mar', income: 75800, expenses: 43000 },
        { month: 'Apr', income: 69200, expenses: 46500 },
        { month: 'May', income: 78650, expenses: 45320 },
        { month: 'Jun', income: 81200, expenses: 47800 },
        { month: 'Jul', income: 78650, expenses: 45320 },
      ],
      currentBalance: 245680,
    },
    assets: [
      { name: 'Dairy Shed', value: 450000 },
      { name: 'Milking Equipment', value: 120000 },
      { name: 'Livestock (15 cows)', value: 900000 },
    ],
    liabilities: [
      { name: 'Equipment Loan', value: 180000 },
      { name: 'Working Capital Loan', value: 95000 },
    ],
    loans: [
      { id: 'LN-1042', type: 'Dairy Development Loan', outstanding: 158000, emi: 15220, nextDue: '2026-08-05', status: 'Active' },
      { id: 'LN-1098', type: 'Working Capital', outstanding: 42000, emi: 4800, nextDue: '2026-07-28', status: 'Active' },
    ],
    riskBreakdown: [
      { name: 'Financial Risk', score: 58 },
      { name: 'Climate Risk', score: 65 },
      { name: 'Market Risk', score: 48 },
      { name: 'Loan Risk', score: 55 },
    ],
    forecast: [
      { month: 'Aug', forecast: 82400, lower: 73800, upper: 91000 },
      { month: 'Sep', forecast: 68500, lower: 57800, upper: 79200 },
      { month: 'Oct', forecast: 74200, lower: 63800, upper: 84600 },
      { month: 'Nov', forecast: 88900, lower: 78400, upper: 99400 },
    ],
    documents: ['KYC.pdf', 'Land_Record.pdf', 'Loan_Agreement.pdf'],
    recommendations: [
      'Recommend Kisan Credit Card renewal ahead of monsoon feed-cost rise.',
      'Loan discipline strong — eligible for lower-interest EMI restructuring.',
    ],
    timeline: [
      { date: '2026-07-14', event: 'Risk score increased from 59 to 62' },
      { date: '2026-06-20', event: 'LN-1098 disbursed' },
      { date: '2026-05-02', event: 'Health score crossed 80 (Good)' },
      { date: '2018-03-11', event: 'Enterprise registered' },
    ],
  },
  'ENT-000198': {
    id: 'ENT-000198',
    name: 'Mai Kali Poultry',
    owner: 'Sundar Patel',
    phone: '+91 98123 45670',
    sector: 'Poultry',
    village: 'Sundarpur',
    district: 'Sehore',
    established: 2020,
    status: 'Under Review',
    healthScore: 52,
    riskScore: 74,
    riskLevel: 'High',
    annualTurnover: 1120000,
    description: 'Poultry enterprise supplying eggs and broilers to regional markets. Recently affected by feed price volatility.',
    financials: {
      monthly: [
        { month: 'Feb', income: 41000, expenses: 36200 },
        { month: 'Mar', income: 38500, expenses: 37800 },
        { month: 'Apr', income: 35200, expenses: 38100 },
        { month: 'May', income: 33800, expenses: 37500 },
        { month: 'Jun', income: 31200, expenses: 36900 },
        { month: 'Jul', income: 29800, expenses: 35400 },
      ],
      currentBalance: 38200,
    },
    assets: [
      { name: 'Poultry Shed', value: 280000 },
      { name: 'Equipment', value: 65000 },
    ],
    liabilities: [
      { name: 'Feed Supplier Credit', value: 48000 },
      { name: 'Equipment Loan', value: 120000 },
    ],
    loans: [
      { id: 'LN-2210', type: 'Poultry Development Loan', outstanding: 96000, emi: 9200, nextDue: '2026-07-25', status: 'Overdue Risk' },
    ],
    riskBreakdown: [
      { name: 'Financial Risk', score: 78 },
      { name: 'Climate Risk', score: 52 },
      { name: 'Market Risk', score: 81 },
      { name: 'Loan Risk', score: 70 },
    ],
    forecast: [
      { month: 'Aug', forecast: 27400, lower: 19800, upper: 35000 },
      { month: 'Sep', forecast: 25100, lower: 17200, upper: 33000 },
      { month: 'Oct', forecast: 29800, lower: 20500, upper: 39100 },
      { month: 'Nov', forecast: 32200, lower: 22800, upper: 41600 },
    ],
    documents: ['KYC.pdf', 'Loan_Agreement.pdf'],
    recommendations: [
      'Flag for field visit — income declined 27% over 6 months.',
      'Review eligibility for feed-cost subsidy scheme before next EMI cycle.',
    ],
    timeline: [
      { date: '2026-07-15', event: 'Risk score crossed high-risk threshold' },
      { date: '2026-07-10', event: 'Flagged for officer review' },
      { date: '2026-04-18', event: 'Income decline alert triggered' },
      { date: '2020-01-22', event: 'Enterprise registered' },
    ],
  },
}

// Fallback generator so every registry row opens a page, even ones without
// hand-authored detail data yet.
export function getEnterpriseDetail(id, fallbackMeta = {}) {
  if (enterpriseDetails[id]) return enterpriseDetails[id]
  return {
    id,
    name: fallbackMeta.name || 'Unknown Enterprise',
    owner: fallbackMeta.owner || '—',
    phone: '+91 90000 00000',
    sector: fallbackMeta.sector || '—',
    village: fallbackMeta.village || '—',
    district: 'Sehore',
    established: 2021,
    status: fallbackMeta.status || 'Active',
    healthScore: 70,
    riskScore: 50,
    riskLevel: fallbackMeta.risk || 'Medium',
    annualTurnover: 1500000,
    description: 'Detailed profile not yet available for this enterprise. Showing baseline data.',
    financials: {
      monthly: [
        { month: 'Feb', income: 50000, expenses: 32000 },
        { month: 'Mar', income: 52000, expenses: 33000 },
        { month: 'Apr', income: 51000, expenses: 34000 },
        { month: 'May', income: 53000, expenses: 33500 },
        { month: 'Jun', income: 54000, expenses: 34500 },
        { month: 'Jul', income: 55000, expenses: 35000 },
      ],
      currentBalance: 120000,
    },
    assets: [{ name: 'Business Assets', value: 300000 }],
    liabilities: [{ name: 'Working Capital Loan', value: 60000 }],
    loans: [{ id: 'LN-0000', type: 'General Loan', outstanding: 60000, emi: 5500, nextDue: '2026-08-01', status: 'Active' }],
    riskBreakdown: [
      { name: 'Financial Risk', score: 50 },
      { name: 'Climate Risk', score: 50 },
      { name: 'Market Risk', score: 50 },
      { name: 'Loan Risk', score: 50 },
    ],
    forecast: [
      { month: 'Aug', forecast: 52000, lower: 45000, upper: 59000 },
      { month: 'Sep', forecast: 53000, lower: 46000, upper: 60000 },
      { month: 'Oct', forecast: 54000, lower: 47000, upper: 61000 },
      { month: 'Nov', forecast: 55000, lower: 48000, upper: 62000 },
    ],
    documents: ['KYC.pdf'],
    recommendations: ['No specific recommendations yet — insufficient history.'],
    timeline: [{ date: '2026-07-01', event: 'Enterprise registered' }],
  }
}
