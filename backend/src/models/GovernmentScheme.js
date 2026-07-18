const mongoose = require("mongoose");

const governmentSchemeSchema = new mongoose.Schema(
  {
    name: String,

    enterpriseType: String,

    state: String,

    incomeLimit: Number,

    benefits: String,

    requiredDocuments: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "GovernmentScheme",
  governmentSchemeSchema
);