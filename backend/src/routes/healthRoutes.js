const express = require("express");

const router = express.Router();

const {
  getEnterpriseHealth,
} = require("../controllers/healthController");

router.get("/:enterpriseId", getEnterpriseHealth);

module.exports = router;