const FinancialRecord = require("../models/FinancialRecord");
const { generateAlertsForEnterprise } = require("../services/alertService");
const { sendError } = require("../utils/errorResponse");
const logger = require("../utils/logger");

// Get all records
exports.getFinancialRecords = async (req, res) => {
  try {
    const records = await FinancialRecord.find().populate(
      "enterprise",
      "name type"
    );

    res.status(200).json(records);
  } catch (err) {
    return sendError(res, err, { req });
  }
};

// Get one record
exports.getFinancialRecord = async (req, res) => {
  try {
    const record = await FinancialRecord.findById(req.params.id).populate(
      "enterprise",
      "name type"
    );

    if (!record) {
      return res.status(404).json({
        message: "Financial record not found",
      });
    }

    res.json(record);
  } catch (err) {
    return sendError(res, err, { req });
  }
};

// Create record
exports.createFinancialRecord = async (req, res) => {
  try {
    const record = await FinancialRecord.create(req.body);

    res.status(201).json(record);

    // Fire-and-forget: alert generation must never affect the response
    // that was already sent above.
    if (record.enterprise) {
      generateAlertsForEnterprise(record.enterprise).catch((err) =>
        logger.warn("Post-create alert generation failed", { error: err.message })
      );
    }
  } catch (err) {
    return sendError(res, err, { req });
  }
};

// Update record
exports.updateFinancialRecord = async (req, res) => {
  try {
    const record = await FinancialRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        message: "Financial record not found",
      });
    }

    res.json(record);

    if (record.enterprise) {
      generateAlertsForEnterprise(record.enterprise).catch((err) =>
        logger.warn("Post-update alert generation failed", { error: err.message })
      );
    }
  } catch (err) {
    return sendError(res, err, { req });
  }
};

// Delete record
exports.deleteFinancialRecord = async (req, res) => {
  try {
    const record = await FinancialRecord.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "Financial record not found",
      });
    }

    res.json({
      message: "Financial record deleted successfully",
    });
  } catch (err) {
    return sendError(res, err, { req });
  }
};