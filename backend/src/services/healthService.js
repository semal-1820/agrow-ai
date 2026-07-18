exports.calculateHealth = (records) => {
  if (!records || records.length === 0) {
    throw new Error("No financial records available");
  }

  const latest = records[records.length - 1];

  const revenue = latest.revenue || 0;
  const expenses = latest.expenses || 0;
  const assets = latest.assets || 0;
  const liabilities = latest.liabilities || 0;
  const loanEMI = latest.loanEMI || 0;

  // 1. Liquidity Score
  let liquidity = 50;

  if (liabilities > 0) {
    const liquidityRatio = assets / liabilities;

    if (liquidityRatio >= 2) liquidity = 100;
    else if (liquidityRatio >= 1.5) liquidity = 80;
    else if (liquidityRatio >= 1) liquidity = 60;
    else liquidity = 30;
  } else if (assets > 0) {
    liquidity = 100;
  }

  // 2. Profitability Score
  let profitability = 0;

  if (revenue > 0) {
    const profitMargin = (revenue - expenses) / revenue;

    if (profitMargin >= 0.3) profitability = 100;
    else if (profitMargin >= 0.2) profitability = 85;
    else if (profitMargin >= 0.1) profitability = 70;
    else if (profitMargin >= 0) profitability = 50;
    else profitability = 20;
  }

  // 3. Debt Score
  let debtScore = 100;

  if (assets > 0) {
    const debtRatio = liabilities / assets;

    if (debtRatio > 0.8) debtScore = 20;
    else if (debtRatio > 0.6) debtScore = 40;
    else if (debtRatio > 0.4) debtScore = 60;
    else if (debtRatio > 0.2) debtScore = 80;
  }

  // 4. Revenue Growth Score
  let revenueGrowth = 50;

  if (records.length >= 2) {
    const previous = records[records.length - 2];

    if (previous.revenue > 0) {
      const growth =
        (revenue - previous.revenue) / previous.revenue;

      if (growth >= 0.2) revenueGrowth = 100;
      else if (growth >= 0.1) revenueGrowth = 85;
      else if (growth >= 0) revenueGrowth = 70;
      else if (growth >= -0.1) revenueGrowth = 45;
      else revenueGrowth = 20;
    }
  }

  // 5. Expense Control Score
  let expenseControl = 0;

  if (revenue > 0) {
    const expenseRatio = expenses / revenue;

    if (expenseRatio <= 0.5) expenseControl = 100;
    else if (expenseRatio <= 0.65) expenseControl = 85;
    else if (expenseRatio <= 0.8) expenseControl = 65;
    else if (expenseRatio <= 1) expenseControl = 40;
    else expenseControl = 20;
  }

  // 6. Cash Flow Score
  let cashFlowScore = 0;

  const cashFlow = revenue - expenses - loanEMI;

  if (revenue > 0) {
    const cashFlowRatio = cashFlow / revenue;

    if (cashFlowRatio >= 0.3) cashFlowScore = 100;
    else if (cashFlowRatio >= 0.2) cashFlowScore = 85;
    else if (cashFlowRatio >= 0.1) cashFlowScore = 70;
    else if (cashFlowRatio >= 0) cashFlowScore = 50;
    else cashFlowScore = 20;
  }

  const healthScore = Math.round(
    liquidity * 0.15 +
    profitability * 0.2 +
    debtScore * 0.15 +
    revenueGrowth * 0.15 +
    expenseControl * 0.15 +
    cashFlowScore * 0.2
  );

  let status;

  if (healthScore >= 80) {
    status = "Excellent";
  } else if (healthScore >= 60) {
    status = "Good";
  } else if (healthScore >= 40) {
    status = "Needs Attention";
  } else {
    status = "Critical";
  }

  return {
    healthScore,
    status,
    components: {
      liquidity,
      profitability,
      debtRatio: debtScore,
      revenueGrowth,
      expenseControl,
      cashFlow: cashFlowScore,
    },
  };
};