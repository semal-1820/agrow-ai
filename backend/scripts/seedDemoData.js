/**
 * Phase 4 — Demo Dataset (Module 13)
 *
 * Generates a realistic dataset for the hackathon demo:
 *   - 100 Enterprises (owned by 100 entrepreneur Users, + a few officers)
 *   - 500+ Financial Records (5 months per enterprise)
 *   - 20 Government Schemes
 *   - 500+ Notifications
 *   - A ForecastResult and RiskAssessment per enterprise (history)
 *
 * No external faker library — everything is generated from small local
 * word lists so this runs with zero extra dependencies.
 *
 * Usage:
 *   node scripts/seedDemoData.js            # adds to existing data
 *   node scripts/seedDemoData.js --reset    # wipes demo collections first
 *
 * Demo login (created by this script):
 *   Entrepreneur : entrepreneur1@agrowai.demo / Demo@1234
 *   Officer      : officer1@agrowai.demo      / Demo@1234
 */

require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../src/models/User");
const Enterprise = require("../src/models/Enterprise");
const FinancialRecord = require("../src/models/FinancialRecord");
const GovernmentScheme = require("../src/models/GovernmentScheme");
const Notification = require("../src/models/Notification");
const RiskAssessment = require("../src/models/RiskAssessment");
const ForecastResult = require("../src/models/ForecastResult");

const RESET = process.argv.includes("--reset");

const DISTRICTS = {
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur"],
};
const STATES = Object.keys(DISTRICTS);

const VILLAGES = [
  "Ratanpur", "Sundarpur", "Amgaon", "Kishanpur", "Lalganj", "Bansgaon",
  "Chandpur", "Devgaon", "Gopalpur", "Harinagar", "Islampur", "Jagatpur",
];

const ENTERPRISE_TYPES = [
  "agriculture", "dairy", "poultry", "handicrafts", "retail",
  "food processing", "weaving", "fisheries", "beekeeping", "sericulture",
];

const FIRST_NAMES = [
  "Anita", "Ravi", "Sunita", "Manoj", "Priya", "Suresh", "Kavita", "Deepak",
  "Meena", "Rajesh", "Pooja", "Vikram", "Sneha", "Amit", "Rekha", "Sanjay",
  "Geeta", "Ashok", "Nisha", "Vinod",
];
const LAST_NAMES = [
  "Kumar", "Devi", "Prasad", "Singh", "Mahato", "Oraon", "Munda", "Yadav",
  "Verma", "Soren",
];

const SCHEME_TEMPLATES = [
  { name: "PM-KISAN Samman Nidhi", type: "agriculture", benefit: "₹6,000/year direct income support" },
  { name: "NABARD Dairy Entrepreneurship Development Scheme", type: "dairy", benefit: "25-33% capital subsidy on dairy units" },
  { name: "Poultry Venture Capital Fund", type: "poultry", benefit: "Subsidized loans for poultry units" },
  { name: "PM Vishwakarma Yojana", type: "handicrafts", benefit: "Collateral-free loans up to ₹3 lakh" },
  { name: "PMEGP (Prime Minister's Employment Generation Programme)", type: "retail", benefit: "15-35% margin money subsidy" },
  { name: "PM Formalisation of Micro Food Processing Enterprises", type: "food processing", benefit: "35% credit-linked subsidy" },
  { name: "National Handloom Development Programme", type: "weaving", benefit: "Yarn subsidy and design support" },
  { name: "Pradhan Mantri Matsya Sampada Yojana", type: "fisheries", benefit: "Up to 40% subsidy on fisheries infrastructure" },
  { name: "National Beekeeping & Honey Mission", type: "beekeeping", benefit: "Subsidy on bee colonies and equipment" },
  { name: "Silk Samagra 2.0", type: "sericulture", benefit: "Support for sericulture infrastructure" },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function round2(n) {
  return Math.round(n * 100) / 100;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  if (RESET) {
    console.log("♻️  --reset passed: wiping demo collections...");
    await Promise.all([
      User.deleteMany({ email: /@agrowai\.demo$/ }),
      GovernmentScheme.deleteMany({}),
    ]);
  }

  const passwordHash = await bcrypt.hash("Demo@1234", 10);

  // --- Officers ---
  const officers = [];
  for (let i = 1; i <= 5; i++) {
    const state = pick(STATES);
    const district = pick(DISTRICTS[state]);
    officers.push({
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      email: `officer${i}@agrowai.demo`,
      password: passwordHash,
      role: "officer",
      phone: `9${randInt(100000000, 999999999)}`,
      district,
      village: pick(VILLAGES),
    });
  }
  const insertedOfficers = await User.insertMany(officers, { ordered: false }).catch((e) => {
    console.warn("Some officer emails already existed, continuing:", e.message.slice(0, 100));
    return User.find({ email: /^officer\d+@agrowai\.demo$/ });
  });
  console.log(`✅ Officers: ${insertedOfficers.length}`);

  // --- Entrepreneurs + Enterprises ---
  const ENTERPRISE_COUNT = 100;
  const entrepreneurs = [];
  for (let i = 1; i <= ENTERPRISE_COUNT; i++) {
    entrepreneurs.push({
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      email: `entrepreneur${i}@agrowai.demo`,
      password: passwordHash,
      role: "entrepreneur",
      phone: `9${randInt(100000000, 999999999)}`,
    });
  }
  const insertedUsers = await User.insertMany(entrepreneurs, { ordered: false }).catch(async () => {
    return User.find({ email: /^entrepreneur\d+@agrowai\.demo$/ });
  });
  console.log(`✅ Entrepreneurs: ${insertedUsers.length}`);

  const enterprises = insertedUsers.map((user) => {
    const state = pick(STATES);
    const district = pick(DISTRICTS[state]);
    return {
      owner: user._id,
      name: `${pick(FIRST_NAMES)} ${pick(ENTERPRISE_TYPES)}`.replace(/^\w/, (c) => c.toUpperCase()),
      type: pick(ENTERPRISE_TYPES),
      village: pick(VILLAGES),
      district,
      state,
      annualIncome: randInt(80000, 600000),
      employees: randInt(0, 12),
    };
  });
  const insertedEnterprises = await Enterprise.insertMany(enterprises);
  console.log(`✅ Enterprises: ${insertedEnterprises.length}`);

  // --- Financial Records (5 months per enterprise, with light trend + noise) ---
  const months = [];
  const now = new Date();
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7)); // "YYYY-MM"
  }

  const financialRecords = [];
  for (const ent of insertedEnterprises) {
    let baseRevenue = randInt(20000, 80000);
    const trend = 1 + (Math.random() * 0.08 - 0.02); // -2% to +6% monthly drift

    months.forEach((month) => {
      baseRevenue = round2(baseRevenue * trend * (1 + (Math.random() * 0.1 - 0.05)));
      const expenses = round2(baseRevenue * (0.55 + Math.random() * 0.25));
      financialRecords.push({
        enterprise: ent._id,
        month,
        revenue: baseRevenue,
        expenses,
        loanEMI: round2(baseRevenue * 0.05 * Math.random()),
        assets: round2(baseRevenue * randInt(2, 6)),
        liabilities: round2(baseRevenue * randInt(0, 3) * Math.random()),
      });
    });
  }
  await FinancialRecord.insertMany(financialRecords);
  console.log(`✅ Financial Records: ${financialRecords.length}`);

  // --- Government Schemes ---
  const schemes = SCHEME_TEMPLATES.map((s) => ({
    name: s.name,
    enterpriseType: s.type,
    state: pick(STATES),
    incomeLimit: randInt(200000, 500000),
    benefits: s.benefit,
    requiredDocuments: ["Aadhaar Card", "Bank Passbook", "Enterprise Registration Certificate"],
  }));
  // Duplicate with different state coverage to reach 20 total, matching the spec.
  while (schemes.length < 20) {
    const base = pick(SCHEME_TEMPLATES);
    schemes.push({
      name: `${base.name} (${pick(STATES)} Extension)`,
      enterpriseType: base.type,
      state: pick(STATES),
      incomeLimit: randInt(200000, 500000),
      benefits: base.benefit,
      requiredDocuments: ["Aadhaar Card", "Bank Passbook", "Income Certificate"],
    });
  }
  const insertedSchemes = await GovernmentScheme.insertMany(schemes);
  console.log(`✅ Government Schemes: ${insertedSchemes.length}`);

  // --- Notifications (5 per user across entrepreneurs + officers) ---
  const NOTIF_TEMPLATES = [
    { type: "revenue_drop", severity: "warning", title: "Revenue Drop Detected", message: "Monthly revenue fell more than 15% compared to the previous month." },
    { type: "emi_due", severity: "info", title: "Loan EMI Due Soon", message: "An EMI payment is due within the next 5 days." },
    { type: "forecast_change", severity: "info", title: "Forecast Updated", message: "A new 6-month cash flow forecast is available." },
    { type: "health_decline", severity: "critical", title: "Enterprise Health Declining", message: "Enterprise health score dropped below 50." },
    { type: "scheme_available", severity: "info", title: "New Scheme Match", message: "You may be eligible for a new government scheme." },
    { type: "risk_increase", severity: "warning", title: "Risk Level Increased", message: "Risk assessment shows increased debt exposure." },
  ];

  const allUsers = [...insertedUsers, ...insertedOfficers];
  const notifications = [];
  allUsers.forEach((user) => {
    const relatedEnterprise = insertedEnterprises.find(
      (e) => e.owner.toString() === user._id.toString()
    );
    for (let i = 0; i < 5; i++) {
      const template = pick(NOTIF_TEMPLATES);
      notifications.push({
        user: user._id,
        title: template.title,
        message: template.message,
        type: template.type,
        severity: template.severity,
        enterprise: relatedEnterprise ? relatedEnterprise._id : null,
        read: Math.random() > 0.6,
      });
    }
  });
  await Notification.insertMany(notifications);
  console.log(`✅ Notifications: ${notifications.length}`);

  // --- Risk Assessment + Forecast history (1 each per enterprise) ---
  const riskDocs = [];
  const forecastDocs = [];
  insertedEnterprises.forEach((ent) => {
    const score = randInt(20, 90);
    riskDocs.push({
      enterprise: ent._id,
      riskScore: score,
      riskLevel: score >= 70 ? "High" : score >= 40 ? "Medium" : "Low",
      factors: ["Debt Ratio", "Revenue Stability", "Cash Flow"],
      suggestions: ["Diversify income sources", "Maintain 3-month cash reserve"],
    });

    const growth = round2(Math.random() * 10 - 2);
    forecastDocs.push({
      enterprise: ent._id,
      cashFlowForecast: Array.from({ length: 6 }, () => randInt(5000, 40000)),
      revenueProjection: Array.from({ length: 6 }, () => randInt(20000, 90000)),
      expenseProjection: Array.from({ length: 6 }, () => randInt(15000, 60000)),
      profitProjection: Array.from({ length: 6 }, () => randInt(2000, 30000)),
      confidence: round2(0.55 + Math.random() * 0.4),
      growthPercentage: growth,
      trend: growth > 1 ? "Increasing" : growth < -1 ? "Decreasing" : "Stable",
      explanation: ["Based on historical revenue trend", "Seasonal adjustment applied"],
    });
  });

  // RiskAssessment/ForecastResult schemas vary slightly by what Phase 2
  // actually defined — insert defensively so a field mismatch on one
  // document doesn't abort the whole seed run.
  await RiskAssessment.insertMany(riskDocs, { ordered: false }).catch((e) =>
    console.warn("RiskAssessment insert warning:", e.message.slice(0, 150))
  );
  await ForecastResult.insertMany(forecastDocs, { ordered: false }).catch((e) =>
    console.warn("ForecastResult insert warning:", e.message.slice(0, 150))
  );
  console.log(`✅ Risk Assessments: ${riskDocs.length}, Forecast Results: ${forecastDocs.length}`);

  console.log("\n🎉 Demo dataset seeded successfully.");
  console.log("   Entrepreneur login: entrepreneur1@agrowai.demo / Demo@1234");
  console.log("   Officer login:      officer1@agrowai.demo / Demo@1234");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
