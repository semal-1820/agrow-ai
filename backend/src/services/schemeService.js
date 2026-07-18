exports.calculateSchemeMatch = (enterprise, scheme) => {
  let score = 0;
  const reasons = [];

  // Enterprise Type - 40%
  if (
    scheme.enterpriseType &&
    enterprise.type &&
    scheme.enterpriseType.toLowerCase() === enterprise.type.toLowerCase()
  ) {
    score += 40;
    reasons.push("Enterprise type matches the scheme eligibility.");
  }

  // State - 30%
  if (
    scheme.state &&
    enterprise.state &&
    scheme.state.toLowerCase() === enterprise.state.toLowerCase()
  ) {
    score += 30;
    reasons.push("Enterprise location matches the scheme.");
  }

  // Income Eligibility - 30%
  if (
    scheme.incomeLimit &&
    enterprise.annualIncome !== undefined &&
    enterprise.annualIncome <= scheme.incomeLimit
  ) {
    score += 30;
    reasons.push("Annual income is within the scheme eligibility limit.");
  }

  return {
    matchPercentage: score,
    reasons,
  };
};
