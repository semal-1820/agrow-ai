const Enterprise = require("../models/Enterprise");
const RiskAssessment = require("../models/RiskAssessment");
const FinancialRecord = require("../models/FinancialRecord");

const { calculateHealth } = require("../services/healthService");
const { calculateRisk } = require("../services/riskService");
const { generateRecommendations } = require("../services/recommendationService");

exports.getAIDashboard = async (req, res) => {
  try {
    // ---------------------------------------------------------------
    // Risk heat summary + highest risk district/village
    // ---------------------------------------------------------------
    const risks = await RiskAssessment.find().populate(
      "enterprise",
      "name type village district state"
    );

    const districtRisk = {};
    const villageRisk = {};

    risks.forEach((r) => {
      if (!r.enterprise) return;

      const district = r.enterprise.district || "Unknown";
      const village = `${r.enterprise.village || "Unknown"}, ${district}`;

      if (!districtRisk[district]) districtRisk[district] = { total: 0, count: 0, high: 0 };
      districtRisk[district].total += r.score;
      districtRisk[district].count += 1;
      if (r.level === "High") districtRisk[district].high += 1;

      if (!villageRisk[village]) villageRisk[village] = { total: 0, count: 0, high: 0 };
      villageRisk[village].total += r.score;
      villageRisk[village].count += 1;
      if (r.level === "High") villageRisk[village].high += 1;
    });

    const riskHeatSummary = Object.entries(districtRisk)
      .map(([district, v]) => ({
        district,
        averageRiskScore: Math.round(v.total / v.count),
        highRiskEnterprises: v.high,
        totalAssessments: v.count,
      }))
      .sort((a, b) => b.averageRiskScore - a.averageRiskScore);

    const highestRiskDistrict = riskHeatSummary[0] || null;

    const villageRanked = Object.entries(villageRisk)
      .map(([village, v]) => ({
        village,
        averageRiskScore: Math.round(v.total / v.count),
        highRiskEnterprises: v.high,
      }))
      .sort((a, b) => b.averageRiskScore - a.averageRiskScore);

    const highestRiskVillage = villageRanked[0] || null;

    // ---------------------------------------------------------------
    // Growth trends. NOTE: the schema has no historical time-series per
    // district/sector - only per-enterprise FinancialRecord history. This
    // approximates "growth" as the average per-enterprise revenue-growth
    // component (from the existing health engine) rolled up by district
    // and by sector. Enterprises with fewer than 2 financial records are
    // excluded since growth can't be computed from a single point.
    // ---------------------------------------------------------------
    const enterprises = await Enterprise.find();
    const districtGrowth = {};
    const sectorGrowth = {};
    const enterpriseGrowthTrends = [];

    for (const ent of enterprises) {
      const records = await FinancialRecord.find({ enterprise: ent._id }).sort({
        createdAt: 1,
      });
      if (records.length < 2) continue;

      const health = calculateHealth(records);
      const growthScore = health.components.revenueGrowth;

      enterpriseGrowthTrends.push({
        enterprise: ent.name,
        district: ent.district,
        sector: ent.type,
        revenueGrowthScore: growthScore,
      });

      const d = ent.district || "Unknown";
      if (!districtGrowth[d]) districtGrowth[d] = { total: 0, count: 0 };
      districtGrowth[d].total += growthScore;
      districtGrowth[d].count += 1;

      const s = ent.type || "Unknown";
      if (!sectorGrowth[s]) sectorGrowth[s] = { total: 0, count: 0 };
      sectorGrowth[s].total += growthScore;
      sectorGrowth[s].count += 1;
    }

    const districtGrowthRanked = Object.entries(districtGrowth)
      .map(([district, v]) => ({ district, averageGrowthScore: Math.round(v.total / v.count) }))
      .sort((a, b) => b.averageGrowthScore - a.averageGrowthScore);

    const sectorGrowthRanked = Object.entries(sectorGrowth)
      .map(([sector, v]) => ({ sector, averageGrowthScore: Math.round(v.total / v.count) }))
      .sort((a, b) => b.averageGrowthScore - a.averageGrowthScore);

    // ---------------------------------------------------------------
    // District health summary
    // ---------------------------------------------------------------
    const healthByDistrict = {};
    for (const ent of enterprises) {
      const records = await FinancialRecord.find({ enterprise: ent._id }).sort({
        createdAt: 1,
      });
      if (records.length === 0) continue;
      const health = calculateHealth(records);
      const d = ent.district || "Unknown";
      if (!healthByDistrict[d]) healthByDistrict[d] = { total: 0, count: 0 };
      healthByDistrict[d].total += health.healthScore;
      healthByDistrict[d].count += 1;
    }
    const districtHealthSummary = Object.entries(healthByDistrict)
      .map(([district, v]) => ({ district, averageHealthScore: Math.round(v.total / v.count) }))
      .sort((a, b) => b.averageHealthScore - a.averageHealthScore);

    // ---------------------------------------------------------------
    // Priority inspection list (top 10 highest risk)
    // ---------------------------------------------------------------
    const priorityInspectionList = risks
      .filter((r) => r.level === "High")
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((r) => ({
        enterprise: r.enterprise?.name,
        village: r.enterprise?.village,
        district: r.enterprise?.district,
        score: r.score,
      }));

    // ---------------------------------------------------------------
    // Top 10 recommendations - one representative recommendation per
    // top-risk enterprise, generated from that enterprise's real data.
    // ---------------------------------------------------------------
    const topRisks = risks.sort((a, b) => b.score - a.score).slice(0, 10);
    const topRecommendations = [];

    for (const r of topRisks) {
      if (!r.enterprise) continue;
      const records = await FinancialRecord.find({ enterprise: r.enterprise._id }).sort({
        createdAt: 1,
      });
      if (records.length === 0) continue;

      const risk = calculateRisk(records);
      const health = calculateHealth(records);
      const recs = generateRecommendations({ records, risk, health, eligibleSchemes: [] });
      const top = recs.financial[0] || recs.business[0];

      if (top) {
        topRecommendations.push({
          enterprise: r.enterprise.name,
          district: r.enterprise.district,
          recommendation: top.text,
          priority: top.priority,
        });
      }
    }

    // ---------------------------------------------------------------
    // AI-generated summary - templated from the figures above, not a
    // separate model call.
    // ---------------------------------------------------------------
    const summaryParts = [];
    if (highestRiskDistrict) {
      summaryParts.push(
        `${highestRiskDistrict.district} has the highest average risk score (${highestRiskDistrict.averageRiskScore}/100) with ${highestRiskDistrict.highRiskEnterprises} high-risk enterprises.`
      );
    }
    if (districtGrowthRanked[0]) {
      summaryParts.push(
        `${districtGrowthRanked[0].district} shows the strongest revenue growth trend among districts.`
      );
    }
    if (sectorGrowthRanked[0]) {
      summaryParts.push(`${sectorGrowthRanked[0].sector} is the fastest-growing sector by average score.`);
    }
    summaryParts.push(`${priorityInspectionList.length} enterprises are flagged for priority inspection.`);

    res.status(200).json({
      highestRiskDistrict,
      highestRiskVillage,
      fastestGrowingDistrict: districtGrowthRanked[0] || null,
      fastestGrowingSector: sectorGrowthRanked[0] || null,
      enterpriseGrowthTrends,
      riskHeatSummary,
      districtHealthSummary,
      aiGeneratedSummary: summaryParts.join(" "),
      priorityInspectionList,
      topRecommendations,
    });
  } catch (err) {
    console.error("Officer AI Dashboard Error:", err);
    res.status(500).json({ message: err.message });
  }
};
