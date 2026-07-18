const mongoose = require("mongoose");

const financialRecordSchema = new mongoose.Schema(
  {
    enterprise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enterprise",
    },

    month: String,

    revenue: Number,

    expenses: Number,

    loanEMI: Number,

    assets: Number,

    liabilities: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "FinancialRecord",
  financialRecordSchema
);