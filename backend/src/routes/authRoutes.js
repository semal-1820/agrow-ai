const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  register,
  login,
  profile,
} = require("../controllers/authController");

router.get("/test", (req, res) => {
  res.json({
    message: "Auth Route Working"
  });
});

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, profile);

module.exports = router;