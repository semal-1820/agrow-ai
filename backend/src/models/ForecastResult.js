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

    profitProjection: {
      type: [Number],
      default: [],
    },

    growthPercentage: {
      type: Number,
      default: 0,
    },

    trend: {
      type: String,
      default: "Stable",
    },

    explanation: {
      type: [String],
      default: [],
    },

    isFallback: {
      type: Boolean,
      default: false,
    },

    forecastDate: {
      type: Date,
      default: Date.now,
    },

    enterpriseType: {
      type: String,
      default: "default",
    },

    // Module 5 - Forecast Accuracy Tracking.
    // Populated later (see forecastController.compareForecastAccuracy) once
    // actual FinancialRecord entries exist for the months this forecast
    // projected. Each entry: { month, predicted, actual, difference, accuracyPercent }
    accuracyLog: {
      type: [
        {
          monthIndex: Number,
          predictedRevenue: Number,
          actualRevenue: Number,
          difference: Number,
          accuracyPercent: Number,
        },
      ],
      default: [],
    },

    overallAccuracy: {
      type: Number,
      default: null,
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