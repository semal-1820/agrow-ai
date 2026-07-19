const FinancialRecord = require("../models/FinancialRecord");
const RiskAssessment = require("../models/RiskAssessment");
const ForecastResult = require("../models/ForecastResult");
const Enterprise = require("../models/Enterprise");
const GovernmentScheme = require("../models/GovernmentScheme");

const { calculateRisk } = require("./riskService");
const { calculateHealth } = require("./healthService");
const { calculateSchemeMatch } = require("./schemeService");
const { generateRecommendations } = require("./recommendationService");

// ---------------------------------------------------------------------------
// Intent classification - simple, transparent keyword matching. This is
// intentional: an opaque model choosing which data to fetch would undercut
// the "every answer is grounded in real data" requirement just as much as
// a fabricated answer would.
// ---------------------------------------------------------------------------

const ENTREPRENEUR_INTENTS = [
  { intent: "risk_explain", keywords: ["risk score", "risk high", "why is my risk", "risk"] },
  { intent: "health_improve", keywords: ["improve", "health"] },
  { intent: "forecast_explain", keywords: ["forecast", "projection"] },
  { intent: "scheme_best", keywords: ["scheme", "subsidy", "government"] },
  { intent: "cash_flow_improve", keywords: ["cash flow", "cashflow"] },
  { intent: "expense_reduce", keywords: ["expense", "cost", "spending"] },
];

const OFFICER_INTENTS = [
  { intent: "villages_intervention", keywords: ["village"] },
  { intent: "highest_risk", keywords: ["highest risk", "high risk", "risk enterprises"] },
  { intent: "district_summary", keywords: ["district", "performance"] },
  { intent: "sector_decline", keywords: ["sector", "declining"] },
  { intent: "inspection_priority", keywords: ["inspection", "priority", "priorities"] },
];

const classifyIntent = (message, intents) => {
  const lower = (message || "").toLowerCase();
  for (const { intent, keywords } of intents) {
    if (keywords.some((k) => lower.includes(k))) return intent;
  }
  return null;
};

// ---------------------------------------------------------------------------
// Entrepreneur data gathering
// ---------------------------------------------------------------------------

const loadEnterpriseContext = async (enterpriseId) => {
  const enterprise = await Enterprise.findById(enterpriseId);
  if (!enterprise) return null;

  const records = await FinancialRecord.find({ enterprise: enterpriseId }).sort({ createdAt: 1 });
  if (records.length === 0) return { enterprise, records: [] };

  const risk = calculateRisk(records);
  const health = calculateHealth(records);

  const savedForecast = await ForecastResult.findOne({ enterprise: enterpriseId }).sort({
    createdAt: -1,
  });

  const schemes = await GovernmentScheme.find();
  const eligibleSchemes = schemes
    .map((s) => {
      const match = calculateSchemeMatch(enterprise, s);
      return {
        name: s.name,
        matchPercentage: match.matchPercentage,
        reasons: match.reasons,
        benefits: s.benefits,
      };
    })
    .filter((s) => s.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  return { enterprise, records, risk, health, forecast: savedForecast, eligibleSchemes };
};

const answerEntrepreneur = async (intent, enterpriseId) => {
  if (!enterpriseId) {
    return {
      answer:
        "I need an enterpriseId to answer that - which enterprise are you asking about?",
      data: null,
    };
  }

  const ctx = await loadEnterpriseContext(enterpriseId);

  if (!ctx) {
    return { answer: "I couldn't find that enterprise.", data: null };
  }

  if (ctx.records.length === 0) {
    return {
      answer: "There are no financial records for this enterprise yet, so I can't compute an answer from data.",
      data: null,
    };
  }

  switch (intent) {
    case "risk_explain": {
      const { risk } = ctx;
      return {
        answer: `Risk score is ${risk.score}/100 (${risk.level}). Main factors: ${risk.factors.join("; ")}.`,
        data: risk,
      };
    }
    case "health_improve": {
      const { health } = ctx;
      const recs = generateRecommendations({
        records: ctx.records,
        risk: ctx.risk,
        health: ctx.health,
        eligibleSchemes: ctx.eligibleSchemes,
      });
      return {
        answer: `Health score is ${health.healthScore}/100 (${health.status}). To improve it: ${recs.business.concat(recs.financial).slice(0, 3).map((r) => r.text).join(" ")}`,
        data: { health, recommendations: recs.financial.concat(recs.business) },
      };
    }
    case "forecast_explain": {
      if (!ctx.forecast) {
        return {
          answer: "No forecast has been generated for this enterprise yet.",
          data: null,
        };
      }
      return {
        answer: `Forecast trend is "${ctx.forecast.trend}" (${ctx.forecast.growthPercentage}% projected revenue change). Reasons: ${(ctx.forecast.explanation || []).join(" ")}`,
        data: ctx.forecast,
      };
    }
    case "scheme_best": {
      if (ctx.eligibleSchemes.length === 0) {
        return {
          answer: "No government schemes currently match this enterprise's profile.",
          data: [],
        };
      }
      const top = ctx.eligibleSchemes[0];
      return {
        answer: `Best match is "${top.name}" (${top.matchPercentage}% match). ${top.reasons.join(" ")}`,
        data: ctx.eligibleSchemes.slice(0, 5),
      };
    }
    case "cash_flow_improve": {
      const latest = ctx.records[ctx.records.length - 1];
      const cashFlow = (latest.revenue || 0) - (latest.expenses || 0) - (latest.loanEMI || 0);
      const recs = generateRecommendations({
        records: ctx.records,
        risk: ctx.risk,
        health: ctx.health,
        eligibleSchemes: ctx.eligibleSchemes,
      });
      return {
        answer: `Current cash flow is ${cashFlow.toFixed(2)}. Suggestions: ${recs.financial.map((r) => r.text).join(" ")}`,
        data: { cashFlow, recommendations: recs.financial },
      };
    }
    case "expense_reduce": {
      const latest = ctx.records[ctx.records.length - 1];
      const expenseRatio = latest.revenue > 0 ? latest.expenses / latest.revenue : null;
      return {
        answer:
          expenseRatio !== null
            ? `Expenses are currently ${Math.round(expenseRatio * 100)}% of revenue. ${expenseRatio > 0.7 ? "This is high - review discretionary and operating costs first." : "This is within a reasonable range."}`
            : "No revenue recorded to compute an expense ratio.",
        data: { revenue: latest.revenue, expenses: latest.expenses },
      };
    }
    default: {
      return {
        answer: `I can answer questions about risk, enterprise health, forecast, government schemes, cash flow, and expenses for this enterprise. Try asking one of those directly.`,
        data: {
          riskScore: ctx.risk.score,
          healthScore: ctx.health.healthScore,
        },
      };
    }
  }
};

// ---------------------------------------------------------------------------
// Officer data gathering
// ---------------------------------------------------------------------------

const answerOfficer = async (intent) => {
  switch (intent) {
    case "villages_intervention": {
      const risks = await RiskAssessment.find({ level: "High" }).populate(
        "enterprise",
        "village district"
      );
      const counts = {};
      risks.forEach((r) => {
        if (!r.enterprise) return;
        const key = `${r.enterprise.village || "Unknown"}, ${r.enterprise.district || "Unknown"}`;
        counts[key] = (counts[key] || 0) + 1;
      });
      const ranked = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([village, count]) => ({ village, highRiskEnterprises: count }));

      return {
        answer:
          ranked.length > 0
            ? `Villages needing intervention, ranked by high-risk enterprise count: ${ranked.map((r) => `${r.village} (${r.highRiskEnterprises})`).join(", ")}.`
            : "No villages currently have concentrated high-risk enterprises.",
        data: ranked,
      };
    }
    case "highest_risk": {
      const risks = await RiskAssessment.find()
        .populate("enterprise", "name village district")
        .sort({ score: -1 })
        .limit(10);
      return {
        answer: `Top ${risks.length} highest-risk enterprises by score.`,
        data: risks.map((r) => ({
          enterprise: r.enterprise?.name,
          village: r.enterprise?.village,
          score: r.score,
          level: r.level,
        })),
      };
    }
    case "district_summary": {
      const data = await Enterprise.aggregate([
        {
          $group: {
            _id: "$district",
            totalEnterprises: { $sum: 1 },
            averageIncome: { $avg: "$annualIncome" },
          },
        },
        { $project: { _id: 0, district: "$_id", totalEnterprises: 1, averageIncome: { $round: ["$averageIncome", 2] } } },
        { $sort: { totalEnterprises: -1 } },
      ]);
      return {
        answer: `${data.length} districts on record. Largest by enterprise count: ${data[0]?.district || "N/A"} (${data[0]?.totalEnterprises || 0} enterprises).`,
        data,
      };
    }
    case "sector_decline": {
      const risks = await RiskAssessment.find().populate("enterprise", "type");
      const sectorScores = {};
      risks.forEach((r) => {
        if (!r.enterprise) return;
        const type = r.enterprise.type || "Unknown";
        if (!sectorScores[type]) sectorScores[type] = { total: 0, count: 0 };
        sectorScores[type].total += r.score;
        sectorScores[type].count += 1;
      });
      const ranked = Object.entries(sectorScores)
        .map(([sector, v]) => ({ sector, averageRisk: Math.round(v.total / v.count) }))
        .sort((a, b) => b.averageRisk - a.averageRisk);

      return {
        answer:
          ranked.length > 0
            ? `Sectors ranked by average risk score (higher = more concerning): ${ranked.map((s) => `${s.sector} (${s.averageRisk})`).join(", ")}.`
            : "No risk assessments recorded yet to evaluate sectors.",
        data: ranked,
      };
    }
    case "inspection_priority": {
      const risks = await RiskAssessment.find({ level: "High" })
        .populate("enterprise", "name village district")
        .sort({ score: -1 })
        .limit(10);
      return {
        answer: `${risks.length} enterprises recommended for priority inspection.`,
        data: risks.map((r) => ({
          enterprise: r.enterprise?.name,
          village: r.enterprise?.village,
          district: r.enterprise?.district,
          score: r.score,
        })),
      };
    }
    default: {
      return {
        answer:
          "I can answer questions about villages needing intervention, highest-risk enterprises, district performance, declining sectors, and inspection priorities.",
        data: null,
      };
    }
  }
};

exports.chat = async ({ message, role, enterpriseId }) => {
  if (role === "officer") {
    const intent = classifyIntent(message, OFFICER_INTENTS);
    const result = await answerOfficer(intent);
    return { intent: intent || "unrecognized", role, ...result };
  }

  const intent = classifyIntent(message, ENTREPRENEUR_INTENTS);
  const result = await answerEntrepreneur(intent, enterpriseId);
  return { intent: intent || "unrecognized", role: "entrepreneur", ...result };
};
