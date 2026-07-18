const mongoose = require("mongoose");

const riskAssessmentSchema = new mongoose.Schema(
  {
    enterprise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enterprise",
    },

    score: Number,

    level: String,

    factors: [String],

    suggestions: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RiskAssessment",
  riskAssessmentSchema
);