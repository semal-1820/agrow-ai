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

// ---------------------------------------------------------------------------
// Module 8 - Personalized Scheme Advisor
// ---------------------------------------------------------------------------

/**
 * Application priority is derived directly from the match percentage
 * already computed above - not a separate opaque score.
 */
exports.computeApplicationPriority = (matchPercentage) => {
  if (matchPercentage >= 80) return "High";
  if (matchPercentage >= 50) return "Medium";
  return "Low";
};

/**
 * Estimated approval probability. This is explicitly a heuristic, not a
 * trained model - there's no historical approval-outcome data in the
 * schema to train one on (SchemeApplication has no feature history yet).
 * It blends match strength with the enterprise's own risk profile, since
 * a low match or a high-risk applicant both plausibly lower approval odds
 * in practice. Documented as an estimate everywhere it's surfaced.
 */
exports.estimateApprovalProbability = (matchPercentage, riskLevel) => {
  let base = matchPercentage; // 0-100

  if (riskLevel === "High") base -= 15;
  else if (riskLevel === "Medium") base -= 5;

  return Math.max(5, Math.min(95, Math.round(base)));
};
