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

financialRecordSchema.index({ enterprise: 1, month: -1 });
financialRecordSchema.index({ enterprise: 1, createdAt: -1 });

module.exports = mongoose.model(
  "FinancialRecord",
  financialRecordSchema
);