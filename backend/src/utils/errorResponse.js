/**
 * Phase 4 — Module 6: Consistent Error Handling
 *
 * Every controller was independently writing:
 *   console.error("X Error:", err);
 *   res.status(500).json({ message: err.message });
 *
 * Three real problems with that, repeated ~60 times:
 *   1. Raw internal error text (Mongoose validation internals, driver
 *      errors, file paths) went straight to the client, even in prod.
 *   2. console.error instead of the winston logger meant these errors
 *      never made it into logs/error.log.
 *   3. The shape `{ message }` doesn't match the centralized error
 *      middleware's `{ success: false, message }`, so a frontend
 *      handler written against one shape could silently miss the other.
 *
 * sendError() is a drop-in replacement for that whole block, and is
 * purely additive — it doesn't change status codes or the presence of
 * `message` in the body, so nothing that already reads
 * `err.response.data.message` on the frontend breaks. It only adds a
 * `success` field and, in production, keeps genuinely unexpected (500)
 * error text server-side instead of exposing it.
 *
 * Usage (replaces the catch block body):
 *   } catch (err) {
 *     return sendError(res, err, { context: "Forecast Generation", req });
 *   }
 */

const logger = require("./logger");

function sendError(res, err, { statusCode, context, req } = {}) {
  const resolvedStatus = statusCode || err.statusCode || 500;

  logger.error(context || err.message, {
    error: err.message,
    stack: err.stack,
    statusCode: resolvedStatus,
    method: req?.method,
    path: req?.originalUrl,
  });

  const isUnexpected = resolvedStatus === 500;
  const message =
    isUnexpected && process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again later."
      : err.message || "An error occurred.";

  return res.status(resolvedStatus).json({
    success: false,
    message,
  });
}

module.exports = { sendError };
