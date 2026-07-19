/**
 * Phase 4 — Security Hardening
 *
 * Express 5 changed req.query into a getter-only property, which breaks the
 * popular express-mongo-sanitize / xss-clean packages (they try to
 * reassign req.query wholesale). Rather than pull in packages that are
 * either unmaintained (xss-clean) or incompatible with Express 5, this file
 * implements the same protections directly: recursive in-place mutation of
 * req.body / req.params / req.query, which Express 5 allows.
 */

const MONGO_OPERATOR_PATTERN = /^\$/;

// Strip any object key that starts with "$" or contains "." — these are
// how NoSQL injection payloads redirect a query (e.g. { "$gt": "" }).
function sanitizeMongoOperators(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeMongoOperators);
  }

  if (value && typeof value === "object") {
    const clean = {};
    for (const key of Object.keys(value)) {
      if (MONGO_OPERATOR_PATTERN.test(key) || key.includes(".")) {
        continue; // drop the key entirely
      }
      clean[key] = sanitizeMongoOperators(value[key]);
    }
    return clean;
  }

  return value;
}

// Escape the handful of characters that make script injection possible in
// HTML contexts. This is deliberately conservative (not a full HTML
// sanitizer) since the data here is JSON API payloads, not raw markup.
function escapeXss(value) {
  if (Array.isArray(value)) {
    return value.map(escapeXss);
  }

  if (value && typeof value === "object") {
    const clean = {};
    for (const key of Object.keys(value)) {
      clean[key] = escapeXss(value[key]);
    }
    return clean;
  }

  if (typeof value === "string") {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }

  return value;
}

function sanitizeRequest(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = escapeXss(sanitizeMongoOperators(req.body));
  }

  if (req.params && typeof req.params === "object") {
    for (const key of Object.keys(req.params)) {
      if (typeof req.params[key] === "string") {
        req.params[key] = escapeXss(sanitizeMongoOperators(req.params[key]));
      }
    }
  }

  if (req.query && typeof req.query === "object") {
    const sanitizedQuery = escapeXss(sanitizeMongoOperators(req.query));
    for (const key of Object.keys(req.query)) {
      if (!(key in sanitizedQuery)) {
        delete req.query[key];
      }
    }
    Object.assign(req.query, sanitizedQuery);
  }

  next();
}

// Lightweight HTTP Parameter Pollution guard: if a query param was sent
// more than once (?role=officer&role=entrepreneur), keep only the last
// value instead of leaving it as an array, which most controllers don't
// expect and could be used to bypass validation.
function preventParameterPollution(req, res, next) {
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      if (Array.isArray(req.query[key])) {
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    }
  }
  next();
}

module.exports = {
  sanitizeRequest,
  preventParameterPollution,
};
