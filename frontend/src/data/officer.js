export const officerSummary = {
  totalEnterprises: 1248,
  healthy: 750,
  mediumRisk: 356,
  highRisk: 142,
}

export const villageData = [
  { village: 'Rampur', enterprises: 236, avgTurnover: 1860000, growth: 18.6, riskLevel: 'Medium' },
  { village: 'Barkheda', enterprises: 198, avgTurnover: 1420000, growth: 12.1, riskLevel: 'Low' },
  { village: 'Sundarpur', enterprises: 176, avgTurnover: 980000, growth: -4.2, riskLevel: 'High' },
  { village: 'Khajuria', enterprises: 142, avgTurnover: 1120000, growth: 6.4, riskLevel: 'Medium' },
  { village: 'Verma Ganj', enterprises: 96, avgTurnover: 890000, growth: 9.8, riskLevel: 'Low' },
]

export const sectorDistribution = [
  { name: 'Dairy', value: 38 },
  { name: 'Farming', value: 30 },
  { name: 'Poultry', value: 15 },
  { name: 'Trading', value: 10 },
  { name: 'Others', value: 7 },
]

export const enterpriseRegistry = [
  { id: 'ENT-000124', name: 'Shree Ram Dairy Farm', owner: 'Ramesh Kumar', village: 'Rampur', sector: 'Dairy', risk: 'Medium', status: 'Active' },
  { id: 'ENT-000198', name: 'Mai Kali Poultry', owner: 'Sundar Patel', village: 'Sundarpur', sector: 'Poultry', risk: 'High', status: 'Under Review' },
  { id: 'ENT-000212', name: 'Green Fields Farm', owner: 'Anil Verma', village: 'Khajuria', sector: 'Farming', risk: 'Low', status: 'Active' },
  { id: 'ENT-000247', name: 'Patel Traders', owner: 'Mahesh Patel', village: 'Barkheda', sector: 'Trading', risk: 'Medium', status: 'Active' },
  { id: 'ENT-000265', name: 'Shri Shakti Traders', owner: 'Vikram Singh', village: 'Rampur', sector: 'Handicrafts', risk: 'Low', status: 'Active' },
]

export const highRiskEnterprises = [
  { id: 'ENT-000198', name: 'Mai Kali Poultry', village: 'Khajuria', riskScore: '74/100', action: 'Review' },
  { id: 'ENT-000340', name: 'Shri Dairy Farm', village: 'Khajuria', riskScore: '78/100', action: 'Review' },
  { id: 'ENT-000412', name: 'Verma Agro', village: 'Barkheda', riskScore: '71/100', action: 'Review' },
]
