const mongoose = require("mongoose");

const enterpriseSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
    },

    village: {
      type: String,
      default: "",
    },

    district: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    annualIncome: {
      type: Number,
      default: 0,
    },

    employees: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

enterpriseSchema.index({ owner: 1 });
enterpriseSchema.index({ district: 1, village: 1 });
enterpriseSchema.index({ type: 1 });

module.exports = mongoose.model(
  "Enterprise",
  enterpriseSchema
);