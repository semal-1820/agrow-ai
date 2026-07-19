const express = require("express");
const router = express.Router();

const {
  getLocale,
  getSupportedLanguages,
} = require("../controllers/localizationController");

// Localization is read-only reference data - no auth required, matching
// how a frontend would fetch it before a user is even logged in.
router.get("/", getSupportedLanguages);
router.get("/:lang", getLocale);

module.exports = router;
