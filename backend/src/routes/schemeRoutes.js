const express = require("express");

const router = express.Router();

const {
  getSchemes,
  createScheme,
  getEligibleSchemes,
} = require("../controllers/schemeController");

router.get("/", getSchemes);

router.post("/", createScheme);

router.get(
  "/eligible/:enterpriseId",
  getEligibleSchemes
);

module.exports = router;