/**
 * Phase 4 — Centralized Application Logging (Module 3)
 *
 * A single winston logger used everywhere instead of scattered
 * console.log calls. Writes:
 *   - logs/error.log   -> error level only
 *   - logs/combined.log -> everything (info and above)
 *   - console           -> human-readable, colorized (dev only by default)
 *
 * Usage:
 *   const logger = require("../utils/logger");
 *   logger.info("User logged in", { userId, role });
 *   logger.warn("Rate limit hit", { ip: req.ip });
 *   logger.error("Forecast service failed", { error: err.message });
 *
 * The JSON file transports mean these logs can be shipped to any future
 * log aggregator (Datadog, ELK, CloudWatch, etc.) without code changes —
 * just add a transport.
 */

const path = require("path");
const winston = require("winston");

const LOG_DIR = path.join(__dirname, "../../logs");
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const NODE_ENV = process.env.NODE_ENV || "development";

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${level}] ${message}${metaStr}`;
  })
);

const transports = [
  new winston.transports.File({
    filename: path.join(LOG_DIR, "error.log"),
    level: "error",
  }),
  new winston.transports.File({
    filename: path.join(LOG_DIR, "combined.log"),
  }),
];

// Always also log to console; keep it readable in dev, structured in prod.
transports.push(
  new winston.transports.Console({
    format: NODE_ENV === "production" ? jsonFormat : consoleFormat,
  })
);

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: jsonFormat,
  defaultMeta: { service: "agrow-ai-backend" },
  transports,
  exitOnError: false,
});

// A dedicated stream so morgan (HTTP request logging) can pipe into the
// same log files/console instead of writing separately with console.log.
logger.httpStream = {
  write: (message) => logger.info(message.trim(), { type: "http" }),
};

module.exports = logger;
