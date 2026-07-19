const express = require("express");
const router = express.Router();

const {
  chatWithAssistant,
  getRecommendations,
  getInsights,
} = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validators");
const { globalLimiter } = require("../middleware/rateLimiter");

router.use(protect);

// Module 1
router.post("/chat", globalLimiter, chatWithAssistant);

// Module 3
router.get(
  "/recommendations/:enterpriseId",
  validateObjectIdParam("enterpriseId"),
  getRecommendations
);

// Module 7
router.get(
  "/insights/:enterpriseId",
  validateObjectIdParam("enterpriseId"),
  getInsights
);

module.exports = router;
