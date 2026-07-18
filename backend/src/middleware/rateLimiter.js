const rateLimit = require("express-rate-limit");

const jsonRateLimitHandler = (req, res /* , next, options */) => {
  res.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
  });
};

// Applied globally to every /api request
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

// Stricter limiter for login/register to slow down brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

// Forecast generation calls the Python ML service, so keep it tighter
const forecastLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

// Officer analytics endpoints run heavier aggregations
const officerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

module.exports = {
  globalLimiter,
  authLimiter,
  forecastLimiter,
  officerLimiter,
};
