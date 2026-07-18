const mongoose = require("mongoose");

const forecastSchema = new mongoose.Schema(
  {
    enterprise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enterprise",
      required: true,
    },

    cashFlowForecast: {
      type: [Number],
      default: [],
    },

    revenueProjection: {
      type: [Number],
      default: [],
    },

    expenseProjection: {
      type: [Number],
      default: [],
    },

    confidence: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ForecastResult",
  forecastSchema
);