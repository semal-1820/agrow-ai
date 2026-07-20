const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { validateObjectIdParam } = require("../middleware/validators");
const { sendError } = require("../utils/errorResponse");

const {
  getDashboard,
  getEnterpriseRegistry,
  getEnterpriseById,
  getEnterpriseFinancials,
  getEnterpriseRisk,
  getEnterpriseHealth,
  getEnterpriseForecast,
  getDistrictAnalytics,
  getVillageAnalytics,
  getSectorDistribution,
  getRiskMonitoring,
  getRiskHeatmap,
  getAIInsights,
} = require("../controllers/officerController");

const { getAIDashboard } = require("../controllers/officerAiController");
const { getOfficerAlerts } = require("../controllers/officerAlertsController");
const {
  getPortfolioRiskReport,
  getVillagePerformanceReport,
  getDefaultPredictionReport,
} = require("../controllers/officerReportsController");
const { generateOfficerAlerts } = require("../services/alertService");
const { officerLimiter } = require("../middleware/rateLimiter");

router.use(protect);
router.use(authorizeRoles("officer"));
router.use(officerLimiter);

router.get("/dashboard", getDashboard);

// Module 6 - Officer AI Dashboard
router.get("/ai-dashboard", getAIDashboard);

// Phase 4, Module 14 audit: the frontend (officerService.getAIInsights,
// AIInsights.jsx) has always called this exact path. The controller
// logic already existed but was never routed — this was a genuinely
// broken page (404 on every load) until this line was added.
router.get("/ai-insights", getAIInsights);

// Module 4 - Smart Alert Engine (officer-side, aggregate alerts)
router.post("/ai-alerts/generate", async (req, res) => {
  try {
    const created = await generateOfficerAlerts();
    res.status(200).json({ generated: created.length, alerts: created });
  } catch (err) {
    return sendError(res, err, { context: "Officer Alert Generation Error:", req });
  }
});

// Phase 4, Module 14 audit: same story as ai-insights above — the
// frontend Alerts page already called this; the controller
// (officerAlertsController.getOfficerAlerts) existed but was unrouted.
router.get("/alerts", getOfficerAlerts);

router.get("/enterprises", getEnterpriseRegistry);

// Phase 4, Module 14 audit: EnterpriseDetail.jsx (officer enterprise
// drill-down page) calls all five of these. The controller functions
// already existed in officerController.js — they just weren't wired to
// any route, so opening an enterprise's detail page 404'd on every tab.
router.get(
  "/enterprises/:id",
  validateObjectIdParam("id"),
  getEnterpriseById
);
router.get(
  "/enterprises/:id/financials",
  validateObjectIdParam("id"),
  getEnterpriseFinancials
);
router.get(
  "/enterprises/:id/risk",
  validateObjectIdParam("id"),
  getEnterpriseRisk
);
router.get(
  "/enterprises/:id/health",
  validateObjectIdParam("id"),
  getEnterpriseHealth
);
router.get(
  "/enterprises/:id/forecast",
  validateObjectIdParam("id"),
  getEnterpriseForecast
);

router.get("/district-analytics", getDistrictAnalytics);

router.get("/village-analytics", getVillageAnalytics);

router.get("/sector-distribution", getSectorDistribution);

router.get("/risk-monitoring", getRiskMonitoring);

router.get("/risk-heatmap", getRiskHeatmap);

// Phase 4, Module 14 audit: OfficerReports.jsx already called all three
// of these paths (getPortfolioRiskReport / getVillagePerformanceReport /
// getDefaultPredictionReport in officerService.js) — none of them existed
// on the backend at all. Implemented in officerReportsController.js.
router.get("/reports/portfolio-risk", getPortfolioRiskReport);
router.get("/reports/village-performance", getVillagePerformanceReport);
router.get("/reports/default-prediction", getDefaultPredictionReport);

module.exports = router;
