const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  register,
  login,
  profile,
} = require("../controllers/authController");

const { authLimiter } = require("../middleware/rateLimiter");
const { validateRegister, validateLogin } = require("../middleware/validators");

router.get("/test", (req, res) => {
  res.json({
    message: "Auth Route Working"
  });
});

// Both validation and brute-force rate limiting were built (validators.js,
// rateLimiter.js) but never wired into any route. Wiring them here.
router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.get("/profile", protect, profile);

module.exports = router;
