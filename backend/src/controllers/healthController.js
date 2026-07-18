const FinancialRecord = require("../models/FinancialRecord");
const { calculateHealth } = require("../services/healthService");

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
    console.error("Enterprise Health Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};