const express = require("express");
const router = express.Router();
const { getHealth } = require("../controllers/systemController");

router.get("/", getHealth);

module.exports = router;
