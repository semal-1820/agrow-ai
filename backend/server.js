require("dotenv").config();

const validateEnv = require("./src/utils/validateEnv");
validateEnv();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const logger = require("./src/utils/logger");

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`, {
    env: process.env.NODE_ENV || "development",
  });
});

// Prevent a single bad promise rejection or uncaught exception from
// silently killing the process without a trace in production.
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", { reason: reason?.message || reason });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { message: err.message, stack: err.stack });
  process.exit(1);
});
