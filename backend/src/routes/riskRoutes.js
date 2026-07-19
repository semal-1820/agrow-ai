const express = require("express");

const router = express.Router();

const {
  assessRisk,
  getRiskAssessment,
} = require("../controllers/riskController");

const protect = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validators");

// SECURITY FIX: previously unauthenticated.
router.use(protect);

router.post("/:enterpriseId", validateObjectIdParam("enterpriseId"), assessRisk);
router.get("/:enterpriseId", validateObjectIdParam("enterpriseId"), getRiskAssessment);

module.exports = router;
