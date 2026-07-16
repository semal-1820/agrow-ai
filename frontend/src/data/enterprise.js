export const enterprise = {
  id: 'ENT-2024-000124',
  name: 'Shree Ram Dairy Farm',
  type: 'Dairy Farming',
  owner: 'Ramesh Kumar',
  village: 'Rampur',
  district: 'Sehore',
  state: 'Madhya Pradesh',
  established: 2018,
  employees: 12,
  annualTurnover: 2480000,
  verified: true,
  description:
    'Engaged in dairy farming and milk production with 15+ cows and daily supply to the local dairy collection center.',
  assets: [
    { name: 'Dairy Shed', value: 450000 },
    { name: 'Milking Equipment', value: 120000 },
    { name: 'Livestock (15 cows)', value: 900000 },
    { name: 'Storage Tank', value: 60000 },
  ],
  liabilities: [
    { name: 'Equipment Loan', value: 180000 },
    { name: 'Working Capital Loan', value: 95000 },
  ],
  loans: [
    { id: 'LN-1042', type: 'Dairy Development Loan', amount: 250000, outstanding: 158000, emi: 15220, nextDue: '2026-08-05', status: 'Active' },
    { id: 'LN-1098', type: 'Working Capital', amount: 100000, outstanding: 42000, emi: 4800, nextDue: '2026-07-28', status: 'Active' },
  ],
  documents: ['KYC.pdf', 'Land_Record.pdf', 'Loan_Agreement.pdf'],
}
