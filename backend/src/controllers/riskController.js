const FinancialRecord = require("../models/FinancialRecord");
const RiskAssessment = require("../models/RiskAssessment");
const { calculateRisk } = require("../services/riskService");
const Enterprise = require("../models/Enterprise");
const Notification = require("../models/Notification");
const { sendError } = require("../utils/errorResponse");
exports.assessRisk = async (req, res) => {
  try {
    const { enterpriseId } = req.params;

    const records = await FinancialRecord.find({
      enterprise: enterpriseId,
    }).sort({ month: 1 });

    if (records.length === 0) {
      return res.status(404).json({
        message: "No financial records found for this enterprise.",
      });
    }

    const risk = calculateRisk(records);

    const assessment = await RiskAssessment.create({
      enterprise: enterpriseId,
      score: risk.score,
      level: risk.level,
      factors: risk.factors,
      suggestions: risk.suggestions,
    });

    res.status(201).json(assessment);
  } catch (err) {
    return sendError(res, err, { context: "Risk Assessment Error:", req });
  }
};

exports.getRiskAssessment = async (req, res) => {
  try {
    const { enterpriseId } = req.params;

    const assessment = await RiskAssessment.findOne({
      enterprise: enterpriseId,
    }).sort({ createdAt: -1 });

    if (!assessment) {
      return res.status(404).json({
        message: "Risk assessment not found.",
      });
    }

    res.status(200).json(assessment);
  } catch (err) {
    return sendError(res, err, { req });
  }
};
