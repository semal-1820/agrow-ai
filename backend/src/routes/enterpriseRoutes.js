const express = require("express");
const router = express.Router();

const {
  getEnterprises,
  getEnterprise,
  createEnterprise,
  updateEnterprise,
  deleteEnterprise,
} = require("../controllers/enterpriseController");

const protect = require("../middleware/authMiddleware");
const {
  validateEnterprise,
  validateObjectIdParam,
} = require("../middleware/validators");

// SECURITY FIX: this router previously had no auth middleware at all -
// any unauthenticated caller could list, read, create, edit, or delete any
// enterprise by ID. Adding `protect` here matches how every other resource
// route in this API already behaves (notifications, officer, scheme
// management, user).
router.use(protect);

router.get("/", getEnterprises);
router.get("/:id", validateObjectIdParam("id"), getEnterprise);
router.post("/", validateEnterprise, createEnterprise);
router.put("/:id", validateObjectIdParam("id"), validateEnterprise, updateEnterprise);
router.delete("/:id", validateObjectIdParam("id"), deleteEnterprise);

module.exports = router;
