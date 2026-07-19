const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getApplications,
  updateApplicationStatus,
  getSchemePerformance,
  getBeneficiaries,
  disburseApplication,
} = require("../controllers/schemeManagementController");

const { officerLimiter } = require("../middleware/rateLimiter");
const {
  validateSchemeStatusUpdate,
  validateDisbursement,
  validateObjectIdParam,
} = require("../middleware/validators");

// All routes require authentication
router.use(protect);

// Only officers can access scheme management
router.use(authorizeRoles("officer"));

router.use(officerLimiter);

// Get all scheme applications
router.get("/applications", getApplications);

// Approve or reject application
router.patch(
  "/applications/:id/status",
  validateObjectIdParam("id"),
  validateSchemeStatusUpdate,
  updateApplicationStatus
);

// Record disbursement
router.patch(
  "/applications/:id/disburse",
  validateObjectIdParam("id"),
  validateDisbursement,
  disburseApplication
);

// Get scheme performance
router.get("/performance", getSchemePerformance);

// Get beneficiaries
router.get("/beneficiaries", getBeneficiaries);

module.exports = router;
