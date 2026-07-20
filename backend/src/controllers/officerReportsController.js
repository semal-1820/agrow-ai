/**
 * Phase 4 — Module 14 (Final Quality Audit)
 *
 * The frontend's officerService.js and OfficerReports.jsx already called
 * these three endpoints (GET /officer/reports/portfolio-risk,
 * /village-performance, /default-prediction) — they just didn't exist on
 * the backend, so the Officer Reports page was silently 404ing on every
 * download attempt. This file implements them for real, reusing the same
 * models/aggregation style as the rest of officerController.js, rather
 * than introducing a new pattern.
 *
 * The frontend downloads these as formatted JSON (see OfficerReports.jsx
 * — it does `JSON.stringify(data, null, 2)` and saves a .json file), so
 * these return plain aggregate JSON, not PDFs.
 */

const Enterprise = require("../models/Enterprise");
const RiskAssessment = require("../models/RiskAssessment");
const ForecastResult = require("../models/ForecastResult");
const { sendError } = require("../utils/errorResponse");

// Latest risk assessment per enterprise, across the whole portfolio.
async function getLatestRiskByEnterprise() {
  const latest = await RiskAssessment.aggregate([
    { $sort: { enterprise: 1, createdAt: -1 } },
    {
      $group: {
        _id: "$enterprise",
        score: { $first: "$score" },
        level: { $first: "$level" },
        factors: { $first: "$factors" },
        suggestions: { $first: "$suggestions" },
        assessedAt: { $first: "$createdAt" },
      },
    },
  ]);
  return latest;
}

exports.getPortfolioRiskReport = async (req, res) => {
  try {
    const [totalEnterprises, latestRisk] = await Promise.all([
      Enterprise.countDocuments(),
      getLatestRiskByEnterprise(),
    ]);

    const levelCounts = { Low: 0, Medium: 0, High: 0, Unassessed: 0 };
    latestRisk.forEach((r) => {
      if (r.level && levelCounts[r.level] !== undefined) {
        levelCounts[r.level] += 1;
      }
    });
    levelCounts.Unassessed = Math.max(
      0,
      totalEnterprises - latestRisk.length
    );

    const averageScore = latestRisk.length
      ? +(
          latestRisk.reduce((sum, r) => sum + (r.score || 0), 0) /
          latestRisk.length
        ).toFixed(1)
      : 0;

    const enterpriseIds = latestRisk
      .filter((r) => r.level === "High")
      .map((r) => r._id);
    const highRiskEnterprises = await Enterprise.find({
      _id: { $in: enterpriseIds },
    }).select("name village district state type");

    res.status(200).json({
      generatedAt: new Date().toISOString(),
      totalEnterprises,
      riskLevelBreakdown: levelCounts,
      averageRiskScore: averageScore,
      highRiskEnterprises: highRiskEnterprises.map((e) => ({
        id: e._id,
        name: e.name,
        village: e.village,
        district: e.district,
        state: e.state,
        type: e.type,
      })),
    });
  } catch (err) {
    return sendError(res, err, { context: "Portfolio Risk Report Error:", req });
  }
};

exports.getVillagePerformanceReport = async (req, res) => {
  try {
    const villageStats = await Enterprise.aggregate([
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
      { $sort: { totalEnterprises: -1 } },
    ]);

    // Attach average risk score per village by joining in-memory —
    // acceptable at this data scale, and keeps the query simple/readable
    // rather than a multi-stage $lookup pipeline for a report endpoint.
    const enterprises = await Enterprise.find().select("village district");
    const latestRisk = await getLatestRiskByEnterprise();
    const riskByEnterpriseId = new Map(
      latestRisk.map((r) => [String(r._id), r.score])
    );

    const villageKey = (village, district) => `${village}__${district}`;
    const scoreSums = new Map();
    const scoreCounts = new Map();

    enterprises.forEach((ent) => {
      const score = riskByEnterpriseId.get(String(ent._id));
      if (score === undefined) return;
      const key = villageKey(ent.village, ent.district);
      scoreSums.set(key, (scoreSums.get(key) || 0) + score);
      scoreCounts.set(key, (scoreCounts.get(key) || 0) + 1);
    });

    const report = villageStats.map((v) => {
      const key = villageKey(v.village, v.district);
      const count = scoreCounts.get(key) || 0;
      const averageRiskScore = count
        ? +((scoreSums.get(key) || 0) / count).toFixed(1)
        : null;
      return { ...v, averageRiskScore };
    });

    res.status(200).json({
      generatedAt: new Date().toISOString(),
      villages: report,
    });
  } catch (err) {
    return sendError(res, err, { context: "Village Performance Report Error:", req });
  }
};

exports.getDefaultPredictionReport = async (req, res) => {
  try {
    const [latestRisk, latestForecasts] = await Promise.all([
      getLatestRiskByEnterprise(),
      ForecastResult.aggregate([
        { $sort: { enterprise: 1, createdAt: -1 } },
        {
          $group: {
            _id: "$enterprise",
            trend: { $first: "$trend" },
            growthPercentage: { $first: "$growthPercentage" },
            confidence: { $first: "$confidence" },
          },
        },
      ]),
    ]);

    const riskByEnterpriseId = new Map(
      latestRisk.map((r) => [String(r._id), r])
    );
    const forecastByEnterpriseId = new Map(
      latestForecasts.map((f) => [String(f._id), f])
    );

    // "Default risk" candidates: High risk level AND a declining forecast
    // trend — the combination that actually predicts repayment trouble,
    // rather than either signal alone.
    const candidateIds = [];
    riskByEnterpriseId.forEach((risk, enterpriseId) => {
      const forecast = forecastByEnterpriseId.get(enterpriseId);
      if (risk.level === "High" && forecast?.trend === "Decreasing") {
        candidateIds.push(enterpriseId);
      }
    });

    const enterprises = await Enterprise.find({
      _id: { $in: candidateIds },
    }).select("name village district state type annualIncome");

    const predictions = enterprises.map((e) => {
      const risk = riskByEnterpriseId.get(String(e._id));
      const forecast = forecastByEnterpriseId.get(String(e._id));
      return {
        id: e._id,
        name: e.name,
        village: e.village,
        district: e.district,
        state: e.state,
        type: e.type,
        annualIncome: e.annualIncome,
        riskScore: risk?.score ?? null,
        forecastTrend: forecast?.trend ?? null,
        forecastGrowthPercentage: forecast?.growthPercentage ?? null,
        forecastConfidence: forecast?.confidence ?? null,
      };
    });

    res.status(200).json({
      generatedAt: new Date().toISOString(),
      criteria: "Risk level: High AND Forecast trend: Decreasing",
      totalCandidates: predictions.length,
      predictions,
    });
  } catch (err) {
    return sendError(res, err, { context: "Default Prediction Report Error:", req });
  }
};
