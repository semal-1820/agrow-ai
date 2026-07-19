/**
 * Generates short, dashboard-card insights. Every insight is derived
 * directly from stored data - no synthetic/placeholder text.
 */

exports.generateInsights = ({ records, risk, health, forecast }) => {
  const insights = [];

  if (records.length >= 2) {
    const latest = records[records.length - 1];
    const previous = records[records.length - 2];

    if (previous.revenue > 0) {
      const change = ((latest.revenue - previous.revenue) / previous.revenue) * 100;
      insights.push({
        type: change >= 0 ? "positive" : "negative",
        title: change >= 0 ? "Revenue increased" : "Revenue decreased",
        message: `Revenue ${change >= 0 ? "increased" : "decreased"} by ${Math.abs(Math.round(change))}% compared to the previous record.`,
      });
    }

    const expenseGrowth = previous.expenses > 0
      ? ((latest.expenses - previous.expenses) / previous.expenses) * 100
      : 0;
    const revenueGrowth = previous.revenue > 0
      ? ((latest.revenue - previous.revenue) / previous.revenue) * 100
      : 0;

    if (expenseGrowth > revenueGrowth + 5) {
      insights.push({
        type: "negative",
        title: "Expenses outpacing revenue",
        message: `Expenses have grown ${Math.round(expenseGrowth)}% while revenue grew ${Math.round(revenueGrowth)}%.`,
      });
    }

    if (previous.assets > 0 && latest.assets > 0) {
      const prevDebtRatio = previous.liabilities / previous.assets;
      const currentDebtRatio = latest.liabilities / latest.assets;
      if (currentDebtRatio < prevDebtRatio - 0.02) {
        insights.push({
          type: "positive",
          title: "Debt ratio improved",
          message: `Debt-to-asset ratio improved from ${Math.round(prevDebtRatio * 100)}% to ${Math.round(currentDebtRatio * 100)}%.`,
        });
      }
    }
  }

  if (health) {
    insights.push({
      type: health.healthScore >= 60 ? "positive" : "negative",
      title: `Enterprise health: ${health.status}`,
      message: `Current health score is ${health.healthScore}/100.`,
    });
  }

  if (risk) {
    insights.push({
      type: risk.level === "Low" ? "positive" : risk.level === "High" ? "negative" : "neutral",
      title: `Risk level: ${risk.level}`,
      message: `Current risk score is ${risk.score}/100.`,
    });
  }

  if (forecast) {
    if (forecast.trend === "Increasing") {
      insights.push({
        type: "positive",
        title: "Forecast indicates growth",
        message: `Projected revenue growth of ~${forecast.growthPercentage}% over the next 6 months (confidence ${Math.round((forecast.confidence || 0) * 100)}%).`,
      });
    } else if (forecast.trend === "Decreasing") {
      insights.push({
        type: "negative",
        title: "Forecast indicates decline",
        message: `Projected revenue change of ~${forecast.growthPercentage}% over the next 6 months (confidence ${Math.round((forecast.confidence || 0) * 100)}%).`,
      });
    } else {
      insights.push({
        type: "neutral",
        title: "Forecast indicates stability",
        message: `Revenue is projected to remain broadly stable over the next 6 months.`,
      });
    }

    const lastCashFlow = forecast.cashFlowForecast?.[forecast.cashFlowForecast.length - 1];
    if (typeof lastCashFlow === "number" && lastCashFlow < 0) {
      insights.push({
        type: "negative",
        title: "Cash flow becoming unstable",
        message: "The forecast projects negative cash flow by the end of the 6-month window.",
      });
    }
  }

  return insights;
};
