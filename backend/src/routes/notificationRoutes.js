const express = require("express");
const router = express.Router();

const {
  getNotifications,
  getNotification,
  createNotification,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", getNotifications);

router.get("/:id", getNotification);

router.post("/", createNotification);

router.put("/:id/read", markAsRead);

router.delete("/:id", deleteNotification);

module.exports = router;