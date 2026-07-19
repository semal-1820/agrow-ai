/**
 * Phase 4 — Environment Variable Validation (Module 1 / Module 7)
 *
 * Fails fast and loudly at boot if a required env var is missing, instead
 * of the app silently limping along (e.g. JWT_SECRET undefined -> every
 * token verifies as invalid, or MONGO_URI undefined -> a confusing
 * mongoose connection error deep in the stack).
 */

const REQUIRED_VARS = ["PORT", "MONGO_URI", "JWT_SECRET", "JWT_EXPIRE"];

// Required only when NODE_ENV=production — things that are fine to
// default in local dev but should never be silently defaulted in prod.
const REQUIRED_IN_PRODUCTION = ["CLIENT_URL", "ML_SERVICE_URL"];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (process.env.NODE_ENV === "production") {
    missing.push(
      ...REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key])
    );
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    console.error(
      "❌ JWT_SECRET is too short (min 16 chars). Generate a strong secret, e.g.:\n" +
        '   node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
    );
    process.exit(1);
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\nCopy backend/.env.example to backend/.env and fill in real values.");
    process.exit(1);
  }
}

module.exports = validateEnv;
