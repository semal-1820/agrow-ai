const express = require("express");

const router = express.Router();

const {
  getSchemes,
  createScheme,
  getEligibleSchemes,
} = require("../controllers/schemeController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  validateScheme,
  validateObjectIdParam,
} = require("../middleware/validators");

router.use(protect);

// Browsing schemes / checking eligibility stays open to any authenticated
// user (entrepreneur or officer). Creating a scheme is an officer action.
router.get("/", getSchemes);

router.post("/", authorizeRoles("officer"), validateScheme, createScheme);

router.get(
  "/eligible/:enterpriseId",
  validateObjectIdParam("enterpriseId"),
  getEligibleSchemes
);

module.exports = router;
