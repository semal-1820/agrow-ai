const validator = require("validator");
const mongoose = require("mongoose");

/**
 * Standardized validation error response:
 * { success: false, errors: ["message1", "message2"] }
 */
const respondWithErrors = (res, errors) =>
  res.status(400).json({
    success: false,
    errors,
  });

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isValidNumber = (value) =>
  value === undefined || value === null || value === "" || !Number.isNaN(Number(value));

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

exports.validateObjectIdParam = (paramName) => (req, res, next) => {
  const value = req.params[paramName];

  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return respondWithErrors(res, [`Invalid or missing ${paramName}.`]);
  }

  next();
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

exports.validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!isNonEmptyString(name)) {
    errors.push("Name is required.");
  }

  if (!isNonEmptyString(email) || !validator.isEmail(email)) {
    errors.push("A valid email is required.");
  }

  if (!isNonEmptyString(password) || password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  if (role && !["entrepreneur", "officer"].includes(role)) {
    errors.push("Role must be either 'entrepreneur' or 'officer'.");
  }

  if (errors.length) {
    return respondWithErrors(res, errors);
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!isNonEmptyString(email) || !validator.isEmail(email)) {
    errors.push("A valid email is required.");
  }

  if (!isNonEmptyString(password)) {
    errors.push("Password is required.");
  }

  if (errors.length) {
    return respondWithErrors(res, errors);
  }

  next();
};

// ---------------------------------------------------------------------------
// Enterprise
// ---------------------------------------------------------------------------

exports.validateEnterprise = (req, res, next) => {
  const { name, type, annualIncome, employees } = req.body;
  const errors = [];

  if (req.method === "POST") {
    if (!isNonEmptyString(name)) {
      errors.push("Enterprise name is required.");
    }

    if (!isNonEmptyString(type)) {
      errors.push("Enterprise type is required.");
    }
  }

  if (!isValidNumber(annualIncome)) {
    errors.push("Annual income must be a number.");
  }

  if (!isValidNumber(employees)) {
    errors.push("Employees must be a number.");
  }

  if (errors.length) {
    return respondWithErrors(res, errors);
  }

  next();
};

// ---------------------------------------------------------------------------
// Financial Records
// ---------------------------------------------------------------------------

exports.validateFinancialRecord = (req, res, next) => {
  const { enterprise, revenue, expenses, loanEMI, assets, liabilities } = req.body;
  const errors = [];

  if (req.method === "POST") {
    if (!enterprise || !mongoose.Types.ObjectId.isValid(enterprise)) {
      errors.push("A valid enterprise ID is required.");
    }
  }

  [
    ["revenue", revenue],
    ["expenses", expenses],
    ["loanEMI", loanEMI],
    ["assets", assets],
    ["liabilities", liabilities],
  ].forEach(([field, value]) => {
    if (!isValidNumber(value)) {
      errors.push(`${field} must be a number.`);
    }
  });

  if (errors.length) {
    return respondWithErrors(res, errors);
  }

  next();
};

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

exports.validateReportRequest = (req, res, next) => {
  const { enterpriseId, type } = req.body;
  const errors = [];

  if (!enterpriseId || !mongoose.Types.ObjectId.isValid(enterpriseId)) {
    errors.push("A valid enterpriseId is required.");
  }

  if (!["Financial", "Forecast", "Risk"].includes(type)) {
    errors.push("Report type must be Financial, Forecast, or Risk.");
  }

  if (errors.length) {
    return respondWithErrors(res, errors);
  }

  next();
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

exports.validateNotification = (req, res, next) => {
  const { title, message } = req.body;
  const errors = [];

  if (!isNonEmptyString(title)) {
    errors.push("Notification title is required.");
  }

  if (!isNonEmptyString(message)) {
    errors.push("Notification message is required.");
  }

  if (errors.length) {
    return respondWithErrors(res, errors);
  }

  next();
};

// ---------------------------------------------------------------------------
// Government Schemes
// ---------------------------------------------------------------------------

exports.validateScheme = (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  if (!isNonEmptyString(name)) {
    errors.push("Scheme name is required.");
  }

  if (req.body.incomeLimit !== undefined && !isValidNumber(req.body.incomeLimit)) {
    errors.push("incomeLimit must be a number.");
  }

  if (errors.length) {
    return respondWithErrors(res, errors);
  }

  next();
};

// ---------------------------------------------------------------------------
// Officer / Scheme Management
// ---------------------------------------------------------------------------

exports.validateSchemeStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const errors = [];

  if (!["Approved", "Rejected"].includes(status)) {
    errors.push("Status must be Approved or Rejected.");
  }

  if (errors.length) {
    return respondWithErrors(res, errors);
  }

  next();
};

exports.validateDisbursement = (req, res, next) => {
  const { amount } = req.body;
  const errors = [];

  if (amount === undefined || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    errors.push("A valid disbursement amount greater than 0 is required.");
  }

  if (errors.length) {
    return respondWithErrors(res, errors);
  }

  next();
};
