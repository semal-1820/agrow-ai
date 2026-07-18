const express = require("express");

const router = express.Router();

const {
  generateReport,
  getReports,
  getReport,
  downloadReport,
} = require("../controllers/reportController");

router.post("/generate", generateReport);

router.get("/", getReports);

router.get("/:id/download", downloadReport);

router.get("/:id", getReport);

module.exports = router;