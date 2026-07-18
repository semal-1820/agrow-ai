const express = require("express");
const router = express.Router();

const {
  getFinancialRecords,
  getFinancialRecord,
  createFinancialRecord,
  updateFinancialRecord,
  deleteFinancialRecord,
} = require("../controllers/financialRecordController");

router.get("/", getFinancialRecords);
router.get("/:id", getFinancialRecord);

router.post("/", createFinancialRecord);

router.put("/:id", updateFinancialRecord);

router.delete("/:id", deleteFinancialRecord);

module.exports = router;