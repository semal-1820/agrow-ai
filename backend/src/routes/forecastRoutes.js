const express = require("express");
const router = express.Router();

const {
  forecastCashFlow,
  getForecastComparison,
  getForecastAccuracy,
} = require("../controllers/forecastController");

const protect = require("../middleware/authMiddleware");
const { forecastLimiter } = require("../middleware/rateLimiter");
const { validateObjectIdParam } = require("../middleware/validators");

// Was previously unauthenticated - anyone could trigger a forecast for any
// enterprise ID. Fixed by requiring a valid JWT like the rest of the API.
router.use(protect);

router.post(
  "/:enterpriseId",
  forecastLimiter,
  validateObjectIdParam("enterpriseId"),
  forecastCashFlow
);

// Module 5 - Forecast Accuracy Tracking
router.get(
  "/comparison/:enterpriseId",
  validateObjectIdParam("enterpriseId"),
  getForecastComparison
);

router.get(
  "/accuracy/:enterpriseId",
  validateObjectIdParam("enterpriseId"),
  getForecastAccuracy
);

module.exports = router;
