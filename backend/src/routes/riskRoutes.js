const express = require("express");

const router = express.Router();

const {
  assessRisk,
  getRiskAssessment,
} = require("../controllers/riskController");

router.post("/:enterpriseId", assessRisk);

router.get("/:enterpriseId", getRiskAssessment);

module.exports = router;