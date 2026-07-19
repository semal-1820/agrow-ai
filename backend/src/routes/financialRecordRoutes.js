const express = require("express");
const router = express.Router();

const {
  getFinancialRecords,
  getFinancialRecord,
  createFinancialRecord,
  updateFinancialRecord,
  deleteFinancialRecord,
} = require("../controllers/financialRecordController");

const protect = require("../middleware/authMiddleware");
const {
  validateFinancialRecord,
  validateObjectIdParam,
} = require("../middleware/validators");

// SECURITY FIX: previously unauthenticated (same issue as enterpriseRoutes).
router.use(protect);

router.get("/", getFinancialRecords);
router.get("/:id", validateObjectIdParam("id"), getFinancialRecord);

router.post("/", validateFinancialRecord, createFinancialRecord);

router.put(
  "/:id",
  validateObjectIdParam("id"),
  validateFinancialRecord,
  updateFinancialRecord
);

router.delete("/:id", validateObjectIdParam("id"), deleteFinancialRecord);

module.exports = router;
