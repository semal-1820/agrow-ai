const GovernmentScheme = require("../models/GovernmentScheme");
const Enterprise = require("../models/Enterprise");
const FinancialRecord = require("../models/FinancialRecord");
const {
  calculateSchemeMatch,
  computeApplicationPriority,
  estimateApprovalProbability,
} = require("../services/schemeService");
const { calculateRisk } = require("../services/riskService");
const { sendError } = require("../utils/errorResponse");

// Get all government schemes
exports.getSchemes = async (req, res) => {
  try {
    const schemes = await GovernmentScheme.find().sort({
      createdAt: -1,
    });

    res.status(200).json(schemes);
  } catch (err) {
    return sendError(res, err, { context: "Get Schemes Error:", req });
  }
};

// Create a government scheme
exports.createScheme = async (req, res) => {
  try {
    const scheme = await GovernmentScheme.create(req.body);

    res.status(201).json(scheme);
  } catch (err) {
    return sendError(res, err, { context: "Create Scheme Error:", req });
  }
};

// Get eligible schemes for an enterprise
exports.getEligibleSchemes = async (req, res) => {
  try {
    const { enterpriseId } = req.params;

    const enterprise = await Enterprise.findById(enterpriseId);

    if (!enterprise) {
      return res.status(404).json({
        message: "Enterprise not found.",
      });
    }

    const schemes = await GovernmentScheme.find();

    // Risk level feeds the approval-probability estimate below. If there
    // are no financial records yet, risk is simply omitted from that
    // estimate rather than guessed.
    const records = await FinancialRecord.find({ enterprise: enterpriseId }).sort({
      createdAt: 1,
    });
    const riskLevel = records.length > 0 ? calculateRisk(records).level : null;

    const recommendations = schemes
      .map((scheme) => {
        const match = calculateSchemeMatch(
          enterprise,
          scheme
        );

        return {
          schemeId: scheme._id,
          name: scheme.name,
          matchPercentage: match.matchPercentage,
          reasons: match.reasons,
          benefits: scheme.benefits,
          requiredDocuments: scheme.requiredDocuments,
          // Module 8 additions:
          eligibilityScore: match.matchPercentage,
          applicationPriority: computeApplicationPriority(match.matchPercentage),
          estimatedApprovalProbability: riskLevel
            ? estimateApprovalProbability(match.matchPercentage, riskLevel)
            : null,
        };
      })
      .filter((scheme) => scheme.matchPercentage > 0)
      .sort(
        (a, b) =>
          b.matchPercentage - a.matchPercentage
      );

    res.status(200).json({
      enterprise: enterpriseId,
      recommendations,
    });
  } catch (err) {
    return sendError(res, err, { context: "Scheme Recommendation Error:", req });
  }
};