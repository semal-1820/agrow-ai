const express = require("express");
const router = express.Router();

const {
  forecastCashFlow,
} = require("../controllers/forecastController");

router.post("/:enterpriseId", forecastCashFlow);

module.exports = router;