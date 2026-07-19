const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const path = require("path");

const logger = require("./utils/logger");
const { sanitizeRequest, preventParameterPollution } = require("./middleware/security");
const systemRoutes = require("./routes/systemRoutes");

const authRoutes = require("./routes/authRoutes");
const enterpriseRoutes = require("./routes/enterpriseRoutes");
const financialRecordRoutes = require("./routes/financialRecordRoutes");
const forecastRoutes = require("./routes/forecastRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const riskRoutes = require("./routes/riskRoutes");
const healthRoutes = require("./routes/healthRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const officerRoutes = require("./routes/officerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const schemeManagementRoutes = require("./routes/schemeManagementRoutes");
const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiRoutes");
const syncRoutes = require("./routes/syncRoutes");
const localizationRoutes = require("./routes/localizationRoutes");

const errorHandler = require("./middleware/errorMiddleware");
const { globalLimiter } = require("./middleware/rateLimiter");

const app = express();

// Trust the first proxy hop (Render/Railway/Nginx) so req.ip and secure
// cookies behave correctly behind a reverse proxy in production.
app.set("trust proxy", 1);

// Middleware
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(
  helmet({
    // Cross-Origin-Resource-Policy defaults to "same-site", which blocks
    // the frontend (a different origin in dev/prod) from loading things
    // like report PDFs served from /uploads.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(compression());

// HTTP request logs go through the same logger as everything else instead
// of a separate console.log stream, so they end up in logs/combined.log.
app.use(morgan("combined", { stream: logger.httpStream }));

// Request size limits — prevents oversized payloads (image dumps, huge
// bodies) from tying up the event loop or exhausting memory.
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// NoSQL-injection / XSS / HTTP-parameter-pollution guards (Module 1).
app.use(sanitizeRequest);
app.use(preventParameterPollution);

// express-rate-limit was installed and built (middleware/rateLimiter.js)
// but never applied anywhere. Applying the global limiter to every /api
// route here; stricter per-route limiters (auth, forecast, officer) are
// applied in their own route files.
app.use("/api", globalLimiter);

// Infrastructure health check (Module 4) — deliberately NOT under /api,
// since /api/health is already the Enterprise Health Engine from Phase 2.
app.use("/health", systemRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Agrow AI Backend Running 🚀",
  });
});

// Test routes
app.get("/api/auth/test", (req, res) => {
  res.json({
    message: "Auth route working",
  });
});

app.get("/api/enterprise/test", (req, res) => {
  res.json({
    message: "Enterprise route working",
  });
});

app.get("/api/financial-records/test", (req, res) => {
  res.json({
    message: "Financial Records route working",
  });
});

// Static uploads
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use(
  "/api/enterprise",
  enterpriseRoutes
);

app.use(
  "/api/financial-records",
  financialRecordRoutes
);

app.use(
  "/api/forecast",
  forecastRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/risk",
  riskRoutes
);

app.use(
  "/api/health",
  healthRoutes
);

app.use(
  "/api/schemes",
  schemeRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/officer",
  officerRoutes
);

app.use(
  "/api/scheme-management",
  schemeManagementRoutes
);

// Phase 3
app.use("/api/ai", aiRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/locale", localizationRoutes);

// 404 handler
// IMPORTANT: This must be after all API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;