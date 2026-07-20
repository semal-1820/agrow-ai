const FinancialRecord = require("../models/FinancialRecord");
const { calculateHealth } = require("../services/healthService");
const { sendError } = require("../utils/errorResponse");

exports.getEnterpriseHealth = async (req, res) => {
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

    const health = calculateHealth(records);

    res.status(200).json({
      enterprise: enterpriseId,
      ...health,
    });
  } catch (err) {
    return sendError(res, err, { context: "Enterprise Health Error:", req });
  }
};