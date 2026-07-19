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
const { validateNotification, validateObjectIdParam } = require("../middleware/validators");

router.use(authMiddleware);

router.get("/", getNotifications);

router.get("/:id", validateObjectIdParam("id"), getNotification);

router.post("/", validateNotification, createNotification);

router.put("/:id/read", validateObjectIdParam("id"), markAsRead);

router.delete("/:id", validateObjectIdParam("id"), deleteNotification);

module.exports = router;
