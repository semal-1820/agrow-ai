const RiskAssessment = require("../models/RiskAssessment");

exports.getOfficerAlerts = async (req, res) => {
  try {
    const highRiskAssessments = await RiskAssessment.find({
      level: "High",
    })
      .populate(
        "enterprise",
        "name village district state"
      )
      .sort({ updatedAt: -1 })
      .limit(20);

    const alerts = highRiskAssessments
      .filter((risk) => risk.enterprise)
      .map((risk) => ({
        id: risk._id,
        title: `${risk.enterprise.name} — High risk score detected (${risk.score}/100)`,
        severity: "high",
        date: risk.updatedAt,
        enterprise: {
          id: risk.enterprise._id,
          name: risk.enterprise.name,
          village: risk.enterprise.village,
          district: risk.enterprise.district,
        },
        factors: risk.factors || [],
        suggestions: risk.suggestions || [],
      }));

    res.status(200).json(alerts);
  } catch (err) {
    console.error(
      "Officer Alerts Error:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};