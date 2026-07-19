const FinancialRecord = require("../models/FinancialRecord");
const Enterprise = require("../models/Enterprise");
const GovernmentScheme = require("../models/GovernmentScheme");
const ForecastResult = require("../models/ForecastResult");

const { calculateRisk } = require("../services/riskService");
const { calculateHealth } = require("../services/healthService");
const { calculateSchemeMatch } = require("../services/schemeService");
const { generateRecommendations } = require("../services/recommendationService");
const { generateInsights } = require("../services/insightService");
const { chat } = require("../services/aiAssistantService");

// Module 1 - AI Chat Assistant
exports.chatWithAssistant = async (req, res) => {
  try {
    const { message, enterpriseId } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "A chat 'message' is required." });
    }

    const result = await chat({
      message,
      role: req.user.role,
      enterpriseId: enterpriseId || null,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Module 3 - Smart Recommendation Engine
exports.getRecommendations = async (req, res) => {
  try {
    const { enterpriseId } = req.params;

    const enterprise = await Enterprise.findById(enterpriseId);
    if (!enterprise) {
      return res.status(404).json({ message: "Enterprise not found." });
    }

    const records = await FinancialRecord.find({ enterprise: enterpriseId }).sort({
      createdAt: 1,
    });

    if (records.length === 0) {
      return res.status(404).json({
        message: "No financial records found for this enterprise.",
      });
    }

    const risk = calculateRisk(records);
    const health = calculateHealth(records);

    const schemes = await GovernmentScheme.find();
    const eligibleSchemes = schemes
      .map((s) => {
        const match = calculateSchemeMatch(enterprise, s);
        return { name: s.name, matchPercentage: match.matchPercentage };
      })
      .filter((s) => s.matchPercentage > 0);

    const recommendations = generateRecommendations({
      records,
      risk,
      health,
      eligibleSchemes,
    });

    res.status(200).json({ enterprise: enterpriseId, recommendations });
  } catch (err) {
    console.error("Recommendation Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Module 7 - AI Business Insights
exports.getInsights = async (req, res) => {
  try {
    const { enterpriseId } = req.params;

    const records = await FinancialRecord.find({ enterprise: enterpriseId }).sort({
      createdAt: 1,
    });

    if (records.length === 0) {
      return res.status(404).json({
        message: "No financial records found for this enterprise.",
      });
    }

    const risk = calculateRisk(records);
    const health = calculateHealth(records);
    const forecast = await ForecastResult.findOne({ enterprise: enterpriseId }).sort({
      createdAt: -1,
    });

    const insights = generateInsights({ records, risk, health, forecast });

    res.status(200).json({ enterprise: enterpriseId, insights });
  } catch (err) {
    console.error("Insights Error:", err);
    res.status(500).json({ message: err.message });
  }
};
