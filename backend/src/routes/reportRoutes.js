const express = require("express");

const router = express.Router();

const {
  generateReport,
  getReports,
  getReport,
  downloadReport,
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");
const {
  validateReportRequest,
  validateObjectIdParam,
} = require("../middleware/validators");

// SECURITY FIX: previously unauthenticated - anyone could generate or
// download any enterprise's financial/risk/forecast report.
router.use(protect);

router.post("/generate", validateReportRequest, generateReport);

router.get("/", getReports);

router.get("/:id/download", validateObjectIdParam("id"), downloadReport);

router.get("/:id", validateObjectIdParam("id"), getReport);

module.exports = router;
