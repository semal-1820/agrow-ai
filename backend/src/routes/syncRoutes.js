const express = require("express");
const router = express.Router();

const {
  pushToQueue,
  getQueue,
  resolveConflict,
  retryFailed,
} = require("../controllers/syncController");

const protect = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validators");

router.use(protect);

// Sync Queue API / Offline Changes API
router.post("/queue", pushToQueue);
router.get("/queue", getQueue);

// Conflict Resolution API
router.post("/conflict/:id/resolve", validateObjectIdParam("id"), resolveConflict);

// Retry Failed Sync API
router.post("/retry/:id", validateObjectIdParam("id"), retryFailed);

module.exports = router;
