const FinancialRecord = require("../models/FinancialRecord");
const RiskAssessment = require("../models/RiskAssessment");
const ForecastResult = require("../models/ForecastResult");
const Notification = require("../models/Notification");
const Enterprise = require("../models/Enterprise");
const User = require("../models/User");
const { calculateHealth } = require("./healthService");

const PCT_DROP_THRESHOLD = 0.15; // 15% swing is treated as significant
const RECENT_WINDOW_HOURS = 24;

/**
 * Avoid spamming the same alert every time a record is added. If an alert
 * of the same type for the same enterprise was already created in the last
 * RECENT_WINDOW_HOURS, skip it.
 */
const alreadyAlertedRecently = async (userId, enterpriseId, type) => {
  const since = new Date(Date.now() - RECENT_WINDOW_HOURS * 60 * 60 * 1000);

  const existing = await Notification.findOne({
    user: userId,
    enterprise: enterpriseId,
    type,
    createdAt: { $gte: since },
  });

  return !!existing;
};

const createAlert = async ({ userId, enterpriseId, title, message, type, severity }) => {
  if (await alreadyAlertedRecently(userId, enterpriseId, type)) {
    return null;
  }

  return Notification.create({
    user: userId,
    enterprise: enterpriseId,
    title,
    message,
    type,
    severity,
  });
};

/**
 * Entrepreneur-facing alerts for a single enterprise. Call this after a
 * financial record is created/updated so alerts reflect the latest data.
 * Never throws - alert generation is best-effort and should not block the
 * financial record write it's triggered from.
 */
exports.generateAlertsForEnterprise = async (enterpriseId) => {
  try {
    const enterprise = await Enterprise.findById(enterpriseId);
    if (!enterprise) return [];

    const userId = enterprise.owner;
    const created = [];

    const records = await FinancialRecord.find({ enterprise: enterpriseId }).sort({
      createdAt: 1,
    });

    if (records.length === 0) return [];

    const latest = records[records.length - 1];
    const previous = records.length >= 2 ? records[records.length - 2] : null;

    // --- Revenue / expense movement, EMI, cash flow -------------------
    if (previous) {
      if (previous.revenue > 0) {
        const revenueChange = (latest.revenue - previous.revenue) / previous.revenue;

        if (revenueChange <= -PCT_DROP_THRESHOLD) {
          const a = await createAlert({
            userId,
            enterpriseId,
            type: "revenue_drop",
            severity: "warning",
            title: "Revenue dropped",
            message: `Revenue fell by ${Math.abs(Math.round(revenueChange * 100))}% compared to the previous record (${previous.revenue} -> ${latest.revenue}).`,
          });
          if (a) created.push(a);
        }
      }

      if (previous.expenses > 0) {
        const expenseChange = (latest.expenses - previous.expenses) / previous.expenses;

        if (expenseChange >= PCT_DROP_THRESHOLD) {
          const a = await createAlert({
            userId,
            enterpriseId,
            type: "expense_spike",
            severity: "warning",
            title: "Expenses increased",
            message: `Expenses rose by ${Math.round(expenseChange * 100)}% compared to the previous record (${previous.expenses} -> ${latest.expenses}).`,
          });
          if (a) created.push(a);
        }
      }
    }

    const cashFlow = (latest.revenue || 0) - (latest.expenses || 0) - (latest.loanEMI || 0);
    if (cashFlow < 0) {
      const a = await createAlert({
        userId,
        enterpriseId,
        type: "negative_cash_flow",
        severity: "critical",
        title: "Cash flow is negative",
        message: `After expenses and EMI, this enterprise's latest cash flow is ${cashFlow.toFixed(2)}.`,
      });
      if (a) created.push(a);
    }

    // NOTE: FinancialRecord has no due-date field for loan EMI, so a true
    // "EMI due soon" (calendar-based) alert isn't possible with the current
    // schema. As an honest substitute, flag when EMI is a large share of
    // revenue, which is the underlying risk the alert is meant to catch.
    if (latest.revenue > 0 && latest.loanEMI > 0 && latest.loanEMI / latest.revenue >= 0.3) {
      const a = await createAlert({
        userId,
        enterpriseId,
        type: "emi_due",
        severity: "warning",
        title: "High EMI burden relative to revenue",
        message: `Loan EMI is ${Math.round((latest.loanEMI / latest.revenue) * 100)}% of latest revenue. Confirm upcoming repayment capacity.`,
      });
      if (a) created.push(a);
    }

    // --- Enterprise health decline --------------------------------------
    if (records.length >= 2) {
      const currentHealth = calculateHealth(records);
      const previousHealth = calculateHealth(records.slice(0, -1));

      if (currentHealth.healthScore < previousHealth.healthScore - 5) {
        const a = await createAlert({
          userId,
          enterpriseId,
          type: "health_decline",
          severity: currentHealth.healthScore < 40 ? "critical" : "warning",
          title: "Enterprise health decreased",
          message: `Health score dropped from ${previousHealth.healthScore} to ${currentHealth.healthScore} (${currentHealth.status}).`,
        });
        if (a) created.push(a);
      }
    }

    // --- Risk score increase --------------------------------------------
    const riskHistory = await RiskAssessment.find({ enterprise: enterpriseId }).sort({
      createdAt: -1,
    }).limit(2);

    if (riskHistory.length === 2 && riskHistory[0].score > riskHistory[1].score + 5) {
      const a = await createAlert({
        userId,
        enterpriseId,
        type: "risk_increase",
        severity: riskHistory[0].level === "High" ? "critical" : "warning",
        title: "Risk score increased",
        message: `Risk score rose from ${riskHistory[1].score} to ${riskHistory[0].score} (${riskHistory[0].level}).`,
      });
      if (a) created.push(a);
    }

    // --- Forecast trend change -------------------------------------------
    const forecastHistory = await ForecastResult.find({ enterprise: enterpriseId }).sort({
      createdAt: -1,
    }).limit(2);

    if (forecastHistory.length === 2 && forecastHistory[0].trend !== forecastHistory[1].trend) {
      const a = await createAlert({
        userId,
        enterpriseId,
        type: "forecast_change",
        severity: forecastHistory[0].trend === "Decreasing" ? "warning" : "info",
        title: "Forecast trend changed",
        message: `Revenue forecast trend changed from "${forecastHistory[1].trend}" to "${forecastHistory[0].trend}".`,
      });
      if (a) created.push(a);
    }

    return created;
  } catch (err) {
    console.error("Alert generation error:", err.message);
    return [];
  }
};

/**
 * Officer-facing alerts: village risk concentration, district underperformance,
 * sector decline. Written to every user with role "officer". Intended to be
 * called on a schedule or on-demand from the officer AI dashboard, not on
 * every single write (these are aggregate, not per-enterprise).
 */
exports.generateOfficerAlerts = async () => {
  try {
    const officers = await User.find({ role: "officer" }).select("_id");
    if (officers.length === 0) return [];

    const created = [];

    const risks = await RiskAssessment.find()
      .populate("enterprise", "name village district type")
      .sort({ createdAt: -1 });

    // Village risk concentration: 2+ High-risk enterprises in the same village
    const villageHighRisk = {};
    risks.forEach((r) => {
      if (!r.enterprise || r.level !== "High") return;
      const key = `${r.enterprise.village || "Unknown"}|${r.enterprise.district || "Unknown"}`;
      villageHighRisk[key] = (villageHighRisk[key] || 0) + 1;
    });

    const flaggedVillages = Object.entries(villageHighRisk).filter(([, count]) => count >= 2);

    const since = new Date(Date.now() - RECENT_WINDOW_HOURS * 60 * 60 * 1000);

    for (const officer of officers) {
      for (const [key, count] of flaggedVillages) {
        const [village, district] = key.split("|");
        const message = `${village}, ${district}: ${count} enterprises are currently High risk.`;

        const exists = await Notification.findOne({
          user: officer._id,
          type: "village_risk",
          message,
          createdAt: { $gte: since },
        });
        if (exists) continue;

        const a = await Notification.create({
          user: officer._id,
          title: "Village risk increased",
          message,
          type: "village_risk",
          severity: "warning",
        });
        created.push(a);
      }
    }

    return created;
  } catch (err) {
    console.error("Officer alert generation error:", err.message);
    return [];
  }
};
