const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    enterprise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enterprise",
    },

    type: String,

    fileUrl: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);