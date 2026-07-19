/**
 * Turns risk/health/forecast/scheme output that already exists into
 * categorized, actionable recommendations. Deliberately rule-based (not an
 * LLM call) so every recommendation traces back to a specific number in the
 * enterprise's own data - consistent with the "no fake responses" rule in
 * the AI Chat Assistant.
 */

exports.generateRecommendations = ({ records, risk, health, eligibleSchemes = [] }) => {
  const financial = [];
  const business = [];
  const government = [];
  const growth = [];

  const latest = records[records.length - 1];
  const revenue = latest.revenue || 0;
  const expenses = latest.expenses || 0;
  const assets = latest.assets || 0;
  const liabilities = latest.liabilities || 0;
  const loanEMI = latest.loanEMI || 0;
  const debtRatio = assets > 0 ? liabilities / assets : liabilities > 0 ? 1 : 0;
  const cashFlow = revenue - expenses - loanEMI;

  // --- Financial ---------------------------------------------------------
  if (expenses > revenue * 0.7) {
    financial.push({
      text: "Reduce unnecessary expenses - expenses are consuming more than 70% of revenue.",
      priority: "high",
    });
  }

  if (cashFlow < revenue * 0.1) {
    financial.push({
      text: "Increase reserve funds - current cash flow margin is thin relative to revenue.",
      priority: "high",
    });
  }

  if (debtRatio > 0.5) {
    financial.push({
      text: `Reduce debt burden - liabilities are ${Math.round(debtRatio * 100)}% of assets.`,
      priority: debtRatio > 0.7 ? "high" : "medium",
    });
  }

  if (cashFlow > 0 && cashFlow < revenue * 0.2) {
    financial.push({
      text: "Increase monthly savings - cash flow is positive but has little buffer.",
      priority: "medium",
    });
  }

  if (financial.length === 0) {
    financial.push({ text: "Financial position is stable. Maintain current practices.", priority: "low" });
  }

  // --- Business ------------------------------------------------------------
  if (health && health.components) {
    if (health.components.expenseControl < 60) {
      business.push({
        text: "Improve operational efficiency - expense control score is below 60/100.",
        priority: "high",
      });
    }
    if (health.components.revenueGrowth >= 85 && cashFlow > 0) {
      business.push({
        text: "Consider expanding production - revenue growth and cash flow are both strong.",
        priority: "medium",
      });
    }
    if (health.components.revenueGrowth <= 45) {
      business.push({
        text: "Delay expansion plans until revenue growth stabilizes.",
        priority: "high",
      });
    }
  }

  if (records.length >= 3) {
    const recent = records.slice(-3).map((r) => r.revenue || 0);
    const rising = recent[2] > recent[1] && recent[1] > recent[0];
    if (rising) {
      business.push({
        text: "Revenue has risen for 3 consecutive records - consider increasing inventory to meet demand.",
        priority: "low",
      });
    }
  }

  if (business.length === 0) {
    business.push({ text: "No urgent operational changes indicated by current data.", priority: "low" });
  }

  // --- Government ----------------------------------------------------------
  const strongSchemes = eligibleSchemes.filter((s) => s.matchPercentage >= 60);
  if (strongSchemes.length > 0) {
    strongSchemes.slice(0, 3).forEach((s) => {
      government.push({
        text: `Apply for "${s.name}" - ${s.matchPercentage}% eligibility match.`,
        priority: s.matchPercentage >= 80 ? "high" : "medium",
      });
    });
  } else {
    government.push({
      text: "No strongly matching government schemes found for this enterprise's current profile.",
      priority: "low",
    });
  }

  if (loanEMI > 0 && debtRatio > 0.6) {
    government.push({
      text: "Explore government loan restructuring or subsidy programs given the current debt load.",
      priority: "medium",
    });
  }

  // --- Growth ----------------------------------------------------------------
  if (risk && risk.level === "Low" && cashFlow > revenue * 0.2) {
    growth.push({
      text: "Low risk with healthy cash flow - this is a reasonable window to evaluate expansion investment.",
      priority: "medium",
    });
  }

  if (revenue > 0 && expenses / revenue < 0.6) {
    growth.push({
      text: "Expense ratio is low relative to revenue - there may be room for revenue optimization through reinvestment.",
      priority: "low",
    });
  }

  if (growth.length === 0) {
    growth.push({
      text: "Focus on stabilizing current operations before pursuing growth investment.",
      priority: "medium",
    });
  }

  return { financial, business, government, growth };
};
