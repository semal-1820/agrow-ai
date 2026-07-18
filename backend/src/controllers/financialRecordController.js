const FinancialRecord = require("../models/FinancialRecord");

// Get all records
exports.getFinancialRecords = async (req, res) => {
  try {
    const records = await FinancialRecord.find().populate(
      "enterprise",
      "name type"
    );

    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
};

// Create record
exports.createFinancialRecord = async (req, res) => {
  try {
    const record = await FinancialRecord.create(req.body);

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
};