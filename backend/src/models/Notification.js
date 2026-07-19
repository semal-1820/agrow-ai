const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    title: String,

    message: String,

    read: {
      type: Boolean,
      default: false,
    },

    // Additive fields for the Smart Alert Engine (Phase 3, Module 4).
    // All optional so every existing notification (and every place that
    // creates one with just {user, title, message}) keeps working exactly
    // as before.
    type: {
      type: String,
      enum: [
        "revenue_drop",
        "expense_spike",
        "emi_due",
        "negative_cash_flow",
        "forecast_change",
        "health_decline",
        "risk_increase",
        "scheme_available",
        "village_risk",
        "district_underperforming",
        "sector_declining",
        "inspection_required",
        "general",
      ],
      default: "general",
    },

    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },

    enterprise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enterprise",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ enterprise: 1 });

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);