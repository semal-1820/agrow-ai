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

// All routes require authentication
router.use(protect);

// Only officers can access scheme management
router.use(authorizeRoles("officer"));

// Get all scheme applications
router.get("/applications", getApplications);

// Approve or reject application
router.patch(
  "/applications/:id/status",
  updateApplicationStatus
);

// Record disbursement
router.patch(
  "/applications/:id/disburse",
  disburseApplication
);

// Get scheme performance
router.get(
  "/performance",
  getSchemePerformance
);

// Get beneficiaries
router.get(
  "/beneficiaries",
  getBeneficiaries
);

module.exports = router;