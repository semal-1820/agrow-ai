const Notification = require("../models/Notification");
const { sendError } = require("../utils/errorResponse");

// Get all notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    return sendError(res, err, { req });
  }
};

// Get a single notification
exports.getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json(notification);
  } catch (err) {
    return sendError(res, err, { req });
  }
};

// Create a notification
exports.createNotification = async (req, res) => {
  try {
    const notification = await Notification.create({
      user: req.user.id,
      title: req.body.title,
      message: req.body.message,
    });

    res.status(201).json(notification);
  } catch (err) {
    return sendError(res, err, { req });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json(notification);
  } catch (err) {
    return sendError(res, err, { req });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (err) {
    return sendError(res, err, { req });
  }
};