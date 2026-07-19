const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getDashboard,
  getEnterpriseRegistry,
  getDistrictAnalytics,
  getVillageAnalytics,
  getSectorDistribution,
  getRiskMonitoring,
  getRiskHeatmap,
} = require("../controllers/officerController");

const { getAIDashboard } = require("../controllers/officerAiController");
const { generateOfficerAlerts } = require("../services/alertService");
const { officerLimiter } = require("../middleware/rateLimiter");

router.use(protect);
router.use(authorizeRoles("officer"));
router.use(officerLimiter);

router.get("/dashboard", getDashboard);

// Module 6 - Officer AI Dashboard
router.get("/ai-dashboard", getAIDashboard);

// Module 4 - Smart Alert Engine (officer-side, aggregate alerts)
router.post("/ai-alerts/generate", async (req, res) => {
  try {
    const created = await generateOfficerAlerts();
    res.status(200).json({ generated: created.length, alerts: created });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get(
  "/enterprises",
  getEnterpriseRegistry
);

router.get(
  "/district-analytics",
  getDistrictAnalytics
);

router.get(
  "/village-analytics",
  getVillageAnalytics
);

router.get(
  "/sector-distribution",
  getSectorDistribution
);

router.get(
  "/risk-monitoring",
  getRiskMonitoring
);

router.get(
  "/risk-heatmap",
  getRiskHeatmap
);

module.exports = router;