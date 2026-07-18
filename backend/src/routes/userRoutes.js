const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
} = require("../controllers/userController");

// All profile routes require authentication
router.use(protect);

// Get logged-in user's profile
router.get("/profile", getProfile);

// Update logged-in user's profile
router.put("/profile", updateProfile);

module.exports = router;