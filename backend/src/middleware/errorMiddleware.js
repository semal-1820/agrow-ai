const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    method: req.method,
    path: req.originalUrl,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate value already exists";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  // For anything that isn't one of the known/expected error types above,
  // don't leak internal details (DB connection strings, file paths, raw
  // driver errors) to the client once we're in production.
  const isKnownErrorType = statusCode !== 500;
  if (!isKnownErrorType && process.env.NODE_ENV === "production") {
    message = "Something went wrong. Please try again later.";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;