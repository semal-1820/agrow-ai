const express = require("express");

const router = express.Router();

const {
  getEnterpriseHealth,
} = require("../controllers/healthController");

const protect = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validators");

// SECURITY FIX: previously unauthenticated.
router.use(protect);

router.get(
  "/:enterpriseId",
  validateObjectIdParam("enterpriseId"),
  getEnterpriseHealth
);

module.exports = router;
