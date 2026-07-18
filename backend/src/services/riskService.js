exports.calculateRisk = (records) => {
  if (!records || records.length === 0) {
    throw new Error("No financial records available for risk assessment");
  }

  const latest = records[records.length - 1];

  const revenue = latest.revenue || 0;
  const expenses = latest.expenses || 0;
  const liabilities = latest.liabilities || 0;
  const assets = latest.assets || 0;
  const loanEMI = latest.loanEMI || 0;

  let score = 0;
  const factors = [];
  const suggestions = [];

  // Debt Ratio Risk - Maximum 30 points
  const debtRatio = assets > 0 ? liabilities / assets : 0;

  if (debtRatio > 0.7) {
    score += 30;
    factors.push("High debt-to-asset ratio");
    suggestions.push("Reduce liabilities and avoid taking additional debt.");
  } else if (debtRatio > 0.4) {
    score += 15;
    factors.push("Moderate debt-to-asset ratio");
    suggestions.push("Monitor debt levels and improve asset utilization.");
  }

  // Cash Flow Risk - Maximum 30 points
  const cashFlow = revenue - expenses - loanEMI;

  if (cashFlow < 0) {
    score += 30;
    factors.push("Negative cash flow");
    suggestions.push("Reduce operating expenses and improve revenue generation.");
  } else if (revenue > 0 && cashFlow < revenue * 0.1) {
    score += 15;
    factors.push("Low cash flow margin");
    suggestions.push("Improve cash reserves and control operating expenses.");
  }

  // Loan Burden Risk - Maximum 20 points
  const loanBurden = revenue > 0 ? loanEMI / revenue : 0;

  if (loanBurden > 0.3) {
    score += 20;
    factors.push("High loan repayment burden");
    suggestions.push("Consider restructuring loans or reducing borrowing costs.");
  } else if (loanBurden > 0.15) {
    score += 10;
    factors.push("Moderate loan repayment burden");
  }

  // Revenue Stability Risk - Maximum 20 points
  if (records.length >= 2) {
    const revenues = records.map((record) => record.revenue || 0);

    const averageRevenue =
      revenues.reduce((sum, value) => sum + value, 0) / revenues.length;

    if (averageRevenue > 0) {
      const variance =
        revenues.reduce(
          (sum, value) => sum + Math.pow(value - averageRevenue, 2),
          0
        ) / revenues.length;

      const standardDeviation = Math.sqrt(variance);

      const variation = standardDeviation / averageRevenue;

      if (variation > 0.4) {
        score += 20;
        factors.push("Highly unstable revenue");
        suggestions.push(
          "Diversify revenue sources to reduce fluctuations in monthly income."
        );
      } else if (variation > 0.2) {
        score += 10;
        factors.push("Moderate revenue instability");
        suggestions.push("Monitor seasonal revenue changes and maintain reserves.");
      }
    }
  }

  score = Math.min(Math.round(score), 100);

  let level = "Low";

  if (score >= 70) {
    level = "High";
  } else if (score >= 40) {
    level = "Medium";
  }

  if (factors.length === 0) {
    factors.push("No major financial risk factors detected");
  }

  if (suggestions.length === 0) {
    suggestions.push("Continue maintaining healthy financial practices.");
  }

  return {
    score,
    level,
    factors,
    suggestions,
  };
};