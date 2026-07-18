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

router.use(protect);
router.use(authorizeRoles("officer"));

router.get("/dashboard", getDashboard);

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