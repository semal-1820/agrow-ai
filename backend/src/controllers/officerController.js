const Enterprise = require("../models/Enterprise");
const RiskAssessment = require("../models/RiskAssessment");
const FinancialRecord = require("../models/FinancialRecord");
const ForecastResult = require("../models/ForecastResult");
const { sendError } = require("../utils/errorResponse");


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
    return sendError(res, err, { context: "Officer Dashboard Error:", req });
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
    return sendError(res, err, { req });
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
    return sendError(res, err, { req });
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
    return sendError(res, err, { req });
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
    return sendError(res, err, { req });
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
    return sendError(res, err, { req });
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
    return sendError(res, err, { req });
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
    return sendError(res, err, { req });
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
    return sendError(res, err, { req });
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
    return sendError(res, err, { req });
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
    return sendError(res, err, { req });
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
    return sendError(res, err, { req });
  }
};

// ==========================================
// AI INSIGHTS (aggregated intelligence layer)
// Reuses existing collections/aggregations rather
// than duplicating risk/health/forecast logic.
// ==========================================

exports.getAIInsights = async (req, res) => {
  try {
    const [
      districtStats,
      villageStats,
      sectorStats,
      riskCounts,
      highRiskEnterprises,
      forecasts,
      totalEnterprises,
    ] = await Promise.all([
      // District-wise enterprise counts + income (same shape as getDistrictAnalytics)
      Enterprise.aggregate([
        {
          $group: {
            _id: "$district",
            totalEnterprises: { $sum: 1 },
            averageIncome: { $avg: "$annualIncome" },
          },
        },
        {
          $project: {
            _id: 0,
            district: "$_id",
            totalEnterprises: 1,
            averageIncome: { $round: ["$averageIncome", 2] },
          },
        },
      ]),

      // Village-wise enterprise counts + income (same shape as getVillageAnalytics)
      Enterprise.aggregate([
        {
          $group: {
            _id: { village: "$village", district: "$district" },
            totalEnterprises: { $sum: 1 },
            averageIncome: { $avg: "$annualIncome" },
          },
        },
        {
          $project: {
            _id: 0,
            village: "$_id.village",
            district: "$_id.district",
            totalEnterprises: 1,
            averageIncome: { $round: ["$averageIncome", 2] },
          },
        },
      ]),

      // Sector distribution (same shape as getSectorDistribution)
      Enterprise.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $project: { _id: 0, sector: "$_id", count: 1 } },
        { $sort: { count: -1 } },
      ]),

      // Risk level counts, reused from getDashboard's approach
      RiskAssessment.aggregate([
        { $group: { _id: "$level", count: { $sum: 1 } } },
      ]),

      // Top high-risk enterprises for the priority inspection list
      RiskAssessment.find({ level: "High" })
        .populate("enterprise", "name type village district state")
        .sort({ score: -1 })
        .limit(10),

      // Latest forecast per enterprise (capped for performance)
      ForecastResult.find()
        .sort({ createdAt: -1 })
        .limit(200)
        .populate("enterprise", "name type village district state"),

      Enterprise.countDocuments(),
    ]);

    // ---- District Health Summary ----
    // Blend district enterprise stats with average risk score per district
    const riskByDistrict = {};

    const allRiskAssessments = await RiskAssessment.find()
      .populate("enterprise", "district")
      .lean();

    allRiskAssessments.forEach((risk) => {
      const district = risk.enterprise?.district || "Unknown";
      if (!riskByDistrict[district]) {
        riskByDistrict[district] = { totalScore: 0, count: 0 };
      }
      riskByDistrict[district].totalScore += risk.score || 0;
      riskByDistrict[district].count += 1;
    });

    const districtHealthSummary = districtStats.map((d) => {
      const riskInfo = riskByDistrict[d.district] || { totalScore: 0, count: 0 };
      const averageRiskScore =
        riskInfo.count > 0 ? Math.round(riskInfo.totalScore / riskInfo.count) : 0;

      return {
        district: d.district,
        totalEnterprises: d.totalEnterprises,
        averageIncome: d.averageIncome,
        averageRiskScore,
        healthLabel:
          averageRiskScore >= 70
            ? "Needs Attention"
            : averageRiskScore >= 40
            ? "Moderate"
            : "Healthy",
      };
    });

    // ---- Village Performance Summary ----
    const villagePerformanceSummary = villageStats
      .sort((a, b) => (b.averageIncome || 0) - (a.averageIncome || 0))
      .slice(0, 15);

    // ---- Risk Trends ----
    const riskTrends = {
      high: riskCounts.find((r) => r._id === "High")?.count || 0,
      medium: riskCounts.find((r) => r._id === "Medium")?.count || 0,
      low: riskCounts.find((r) => r._id === "Low")?.count || 0,
    };

    // ---- Forecast Summary ----
    const forecastSummary = {
      enterprisesForecasted: forecasts.length,
      increasing: forecasts.filter((f) => f.trend === "Increasing").length,
      stable: forecasts.filter((f) => f.trend === "Stable").length,
      decreasing: forecasts.filter((f) => f.trend === "Decreasing").length,
      averageConfidence: forecasts.length
        ? Number(
            (
              forecasts.reduce((sum, f) => sum + (f.confidence || 0), 0) /
              forecasts.length
            ).toFixed(2)
          )
        : 0,
      averageGrowthPercentage: forecasts.length
        ? Number(
            (
              forecasts.reduce((sum, f) => sum + (f.growthPercentage || 0), 0) /
              forecasts.length
            ).toFixed(2)
          )
        : 0,
    };

    // ---- Growth Opportunities ----
    const growthOpportunities = forecasts
      .filter((f) => f.trend === "Increasing" && f.enterprise)
      .sort((a, b) => (b.growthPercentage || 0) - (a.growthPercentage || 0))
      .slice(0, 10)
      .map((f) => ({
        enterprise: f.enterprise,
        growthPercentage: f.growthPercentage,
        confidence: f.confidence,
      }));

    // ---- Priority Inspection List ----
    // High risk enterprises whose latest forecast is also declining
    const decliningEnterpriseIds = new Set(
      forecasts
        .filter((f) => f.trend === "Decreasing" && f.enterprise)
        .map((f) => String(f.enterprise._id))
    );

    const priorityInspectionList = highRiskEnterprises
      .filter((risk) => risk.enterprise)
      .map((risk) => ({
        enterprise: risk.enterprise,
        riskScore: risk.score,
        riskLevel: risk.level,
        forecastDeclining: decliningEnterpriseIds.has(String(risk.enterprise._id)),
      }))
      .sort((a, b) => {
        if (a.forecastDeclining === b.forecastDeclining) {
          return (b.riskScore || 0) - (a.riskScore || 0);
        }
        return a.forecastDeclining ? -1 : 1;
      })
      .slice(0, 10);

    // ---- Top Recommendations (derived from the aggregated data above) ----
    const topRecommendations = [];

    if (riskTrends.high > 0) {
      topRecommendations.push(
        `${riskTrends.high} enterprise(s) are currently classified High Risk — prioritize field visits for the priority inspection list.`
      );
    }

    const worstDistrict = [...districtHealthSummary].sort(
      (a, b) => b.averageRiskScore - a.averageRiskScore
    )[0];

    if (worstDistrict && worstDistrict.averageRiskScore >= 40) {
      topRecommendations.push(
        `${worstDistrict.district || "An unspecified district"} has the highest average risk score (${worstDistrict.averageRiskScore}) — consider a targeted outreach program.`
      );
    }

    if (forecastSummary.decreasing > 0) {
      topRecommendations.push(
        `${forecastSummary.decreasing} enterprise(s) show a declining revenue forecast — early intervention (credit counseling, scheme referral) is recommended.`
      );
    }

    if (growthOpportunities.length > 0) {
      topRecommendations.push(
        `${growthOpportunities.length} enterprise(s) show strong growth potential and may be good candidates for expansion-linked government schemes.`
      );
    }

    if (topRecommendations.length === 0) {
      topRecommendations.push(
        "No urgent risk or growth signals detected. Continue routine monitoring."
      );
    }

    res.status(200).json({
      totalEnterprises,
      districtHealthSummary,
      villagePerformanceSummary,
      sectorAnalysis: sectorStats,
      highRiskEnterprises: priorityInspectionList.map((item) => item.enterprise),
      growthOpportunities,
      riskTrends,
      forecastSummary,
      priorityInspectionList,
      topRecommendations,
    });
  } catch (err) {
    return sendError(res, err, { context: "AI Insights Error:", req });
  }
};