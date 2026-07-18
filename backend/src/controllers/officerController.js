const Enterprise = require("../models/Enterprise");
const RiskAssessment = require("../models/RiskAssessment");
const FinancialRecord = require("../models/FinancialRecord");
const ForecastResult = require("../models/ForecastResult");


// ==========================================
// MAIN OFFICER DASHBOARD
// ==========================================

exports.getDashboard = async (req, res) => {
  try {
    const totalEnterprises =
      await Enterprise.countDocuments();

    const highRisk =
      await RiskAssessment.countDocuments({
        level: "High",
      });

    const mediumRisk =
      await RiskAssessment.countDocuments({
        level: "Medium",
      });

    const lowRisk =
      await RiskAssessment.countDocuments({
        level: "Low",
      });

    res.status(200).json({
      totalEnterprises,

      riskSummary: {
        high: highRisk,
        medium: mediumRisk,
        low: lowRisk,
      },
    });
  } catch (err) {
    console.error(
      "Officer Dashboard Error:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================
// ENTERPRISE REGISTRY
// ==========================================

exports.getEnterpriseRegistry = async (
  req,
  res
) => {
  try {
    const enterprises =
      await Enterprise.find()
        .populate(
          "owner",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json(
      enterprises
    );
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================
// GET SINGLE ENTERPRISE
// ==========================================

exports.getEnterpriseById = async (
  req,
  res
) => {
  try {
    const enterprise =
      await Enterprise.findById(
        req.params.id
      ).populate(
        "owner",
        "name email"
      );

    if (!enterprise) {
      return res.status(404).json({
        message:
          "Enterprise not found",
      });
    }

    res.status(200).json(
      enterprise
    );
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================
// GET ENTERPRISE FINANCIAL RECORDS
// ==========================================

exports.getEnterpriseFinancials = async (
  req,
  res
) => {
  try {
    const records =
      await FinancialRecord.find({
        enterprise: req.params.id,
      }).sort({
        createdAt: 1,
      });

    res.status(200).json(
      records
    );
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================
// GET ENTERPRISE RISK
// ==========================================

exports.getEnterpriseRisk = async (
  req,
  res
) => {
  try {
    const risk =
      await RiskAssessment.findOne({
        enterprise: req.params.id,
      }).sort({
        createdAt: -1,
      });

    if (!risk) {
      return res.status(200).json({
        score: 0,
        level: "Low",
        factors: [],
        suggestions: [],
      });
    }

    res.status(200).json(risk);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================
// GET ENTERPRISE HEALTH
// ==========================================

exports.getEnterpriseHealth = async (
  req,
  res
) => {
  try {
    const records =
      await FinancialRecord.find({
        enterprise: req.params.id,
      }).sort({
        createdAt: -1,
      });

    if (records.length === 0) {
      return res.status(200).json({
        score: 0,

        label: "No Data",

        breakdown: {
          liquidity: 0,
          profitability: 0,
          debtManagement: 0,
          cashFlow: 0,
        },

        recommendations: [
          "Add financial records to calculate enterprise health.",
        ],
      });
    }

    const latest = records[0];

    const revenue =
      latest.revenue || 0;

    const expenses =
      latest.expenses || 0;

    const assets =
      latest.assets || 0;

    const liabilities =
      latest.liabilities || 0;

    const loanEMI =
      latest.loanEMI || 0;

    const profit =
      revenue - expenses;


    // ======================================
    // LIQUIDITY SCORE
    // ======================================

    let liquidityScore = 0;

    if (liabilities === 0) {
      liquidityScore =
        assets > 0 ? 100 : 50;
    } else {
      liquidityScore =
        Math.min(
          100,
          (assets /
            liabilities) *
            50
        );
    }


    // ======================================
    // PROFITABILITY SCORE
    // ======================================

    let profitabilityScore = 0;

    if (revenue > 0) {
      profitabilityScore =
        Math.max(
          0,
          Math.min(
            100,

            ((revenue -
              expenses) /
              revenue) *
              100 +
              50
          )
        );
    }


    // ======================================
    // DEBT MANAGEMENT SCORE
    // ======================================

    let debtScore = 100;

    if (assets > 0) {
      const debtRatio =
        liabilities /
        assets;

      debtScore =
        Math.max(
          0,
          100 -
            debtRatio *
              100
        );
    } else if (
      liabilities > 0
    ) {
      debtScore = 0;
    }


    // ======================================
    // CASH FLOW SCORE
    // ======================================

    let cashFlowScore =
      profit >= 0
        ? 80
        : 30;

    if (
      profit >
      loanEMI
    ) {
      cashFlowScore =
        100;
    }


    // ======================================
    // FINAL HEALTH SCORE
    // ======================================

    const score =
      Math.round(
        (liquidityScore +
          profitabilityScore +
          debtScore +
          cashFlowScore) /
          4
      );


    // ======================================
    // HEALTH LABEL
    // ======================================

    let label = "Poor";

    if (score >= 80) {
      label = "Excellent";
    } else if (
      score >= 60
    ) {
      label = "Good";
    } else if (
      score >= 40
    ) {
      label = "Average";
    }


    // ======================================
    // RECOMMENDATIONS
    // ======================================

    const recommendations =
      [];

    if (
      expenses >
      revenue
    ) {
      recommendations.push(
        "Reduce operating expenses to improve profitability."
      );
    }

    if (
      liabilities >
      assets
    ) {
      recommendations.push(
        "Reduce liabilities and improve the debt-to-asset ratio."
      );
    }

    if (
      loanEMI >
      profit
    ) {
      recommendations.push(
        "Review loan obligations because EMI is high relative to current cash flow."
      );
    }

    if (
      recommendations.length ===
      0
    ) {
      recommendations.push(
        "Financial indicators are currently stable. Continue monitoring cash flow."
      );
    }


    // ======================================
    // RESPONSE
    // ======================================

    res.status(200).json({
      score,

      label,

      breakdown: {
        liquidity:
          Math.round(
            liquidityScore
          ),

        profitability:
          Math.round(
            profitabilityScore
          ),

        debtManagement:
          Math.round(
            debtScore
          ),

        cashFlow:
          Math.round(
            cashFlowScore
          ),
      },

      recommendations,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================
// GET ENTERPRISE FORECAST
// ==========================================

exports.getEnterpriseForecast = async (
  req,
  res
) => {
  try {
    const forecast =
      await ForecastResult.findOne({
        enterprise: req.params.id,
      }).sort({
        createdAt: -1,
      });

    if (!forecast) {
      return res.status(200).json({
        forecast: [],

        message:
          "No forecast generated for this enterprise.",
      });
    }

    res.status(200).json(
      forecast
    );
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================
// DISTRICT-WISE ANALYTICS
// ==========================================

exports.getDistrictAnalytics = async (
  req,
  res
) => {
  try {
    const data =
      await Enterprise.aggregate([
        {
          $group: {
            _id:
              "$district",

            totalEnterprises: {
              $sum: 1,
            },

            averageIncome: {
              $avg:
                "$annualIncome",
            },
          },
        },

        {
          $project: {
            _id: 0,

            district:
              "$_id",

            totalEnterprises:
              1,

            averageIncome: {
              $round: [
                "$averageIncome",
                2,
              ],
            },
          },
        },

        {
          $sort: {
            totalEnterprises:
              -1,
          },
        },
      ]);

    res.status(200).json(
      data
    );
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================
// VILLAGE-WISE ANALYTICS
// ==========================================

exports.getVillageAnalytics = async (
  req,
  res
) => {
  try {
    const data =
      await Enterprise.aggregate([
        {
          $group: {
            _id: {
              village:
                "$village",

              district:
                "$district",
            },

            totalEnterprises: {
              $sum: 1,
            },

            averageIncome: {
              $avg:
                "$annualIncome",
            },
          },
        },

        {
          $project: {
            _id: 0,

            village:
              "$_id.village",

            district:
              "$_id.district",

            totalEnterprises:
              1,

            averageIncome: {
              $round: [
                "$averageIncome",
                2,
              ],
            },
          },
        },

        {
          $sort: {
            totalEnterprises:
              -1,
          },
        },
      ]);

    res.status(200).json(
      data
    );
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================
// SECTOR-WISE DISTRIBUTION
// ==========================================

exports.getSectorDistribution = async (
  req,
  res
) => {
  try {
    const data =
      await Enterprise.aggregate([
        {
          $group: {
            _id: "$type",

            count: {
              $sum: 1,
            },
          },
        },

        {
          $project: {
            _id: 0,

            sector:
              "$_id",

            count: 1,
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]);

    res.status(200).json(
      data
    );
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================
// RISK MONITORING
// ==========================================

exports.getRiskMonitoring = async (
  req,
  res
) => {
  try {
    const risks =
      await RiskAssessment.find()
        .populate(
          "enterprise",
          "name type village district state"
        )
        .sort({
          score: -1,
        });

    res.status(200).json(
      risks
    );
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================
// RISK HEATMAP
// ==========================================

exports.getRiskHeatmap = async (
  req,
  res
) => {
  try {
    const risks =
      await RiskAssessment.find()
        .populate(
          "enterprise",
          "name village district state"
        );

    const heatmap = {};

    risks.forEach(
      (risk) => {
        if (
          !risk.enterprise
        ) {
          return;
        }

        const district =
          risk.enterprise
            .district ||
          "Unknown";

        if (
          !heatmap[
            district
          ]
        ) {
          heatmap[
            district
          ] = {
            district,

            totalAssessments:
              0,

            totalRiskScore:
              0,

            highRiskEnterprises:
              0,
          };
        }

        heatmap[
          district
        ].totalAssessments +=
          1;

        heatmap[
          district
        ].totalRiskScore +=
          risk.score || 0;

        if (
          risk.level ===
          "High"
        ) {
          heatmap[
            district
          ].highRiskEnterprises +=
            1;
        }
      }
    );

    const result =
      Object.values(
        heatmap
      ).map(
        (item) => ({
          district:
            item.district,

          averageRiskScore:
            item.totalAssessments >
            0
              ? Math.round(
                  item.totalRiskScore /
                    item.totalAssessments
                )
              : 0,

          highRiskEnterprises:
            item.highRiskEnterprises,

          totalAssessments:
            item.totalAssessments,
        })
      );

    res.status(200).json(
      result
    );
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};