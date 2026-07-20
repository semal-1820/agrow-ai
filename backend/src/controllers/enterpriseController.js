const Enterprise = require("../models/Enterprise");
const { sendError } = require("../utils/errorResponse");

// Get all enterprises
exports.getEnterprises = async (req, res) => {
  try {
    const enterprises = await Enterprise.find().populate("owner", "name email");

    res.status(200).json(enterprises);
  } catch (err) {
    return sendError(res, err, { req });
  }
};

// Get one enterprise
exports.getEnterprise = async (req, res) => {
  try {
    const enterprise = await Enterprise.findById(req.params.id).populate(
      "owner",
      "name email"
    );

    if (!enterprise) {
      return res.status(404).json({ message: "Enterprise not found" });
    }

    res.json(enterprise);
  } catch (err) {
    return sendError(res, err, { req });
  }
};

// Create enterprise
exports.createEnterprise = async (req, res) => {
  try {
    const enterprise = await Enterprise.create(req.body);

    res.status(201).json(enterprise);
  } catch (err) {
    return sendError(res, err, { req });
  }
};

// Update enterprise
exports.updateEnterprise = async (req, res) => {
  try {
    const enterprise = await Enterprise.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!enterprise) {
      return res.status(404).json({ message: "Enterprise not found" });
    }

    res.json(enterprise);
  } catch (err) {
    return sendError(res, err, { req });
  }
};

// Delete enterprise
exports.deleteEnterprise = async (req, res) => {
  try {
    const enterprise = await Enterprise.findByIdAndDelete(req.params.id);

    if (!enterprise) {
      return res.status(404).json({ message: "Enterprise not found" });
    }

    res.json({ message: "Enterprise deleted successfully" });
  } catch (err) {
    return sendError(res, err, { req });
  }
};