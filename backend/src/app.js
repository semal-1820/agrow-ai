const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

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

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// express-rate-limit was installed and built (middleware/rateLimiter.js)
// but never applied anywhere. Applying the global limiter to every /api
// route here; stricter per-route limiters (auth, forecast, officer) are
// applied in their own route files.
app.use("/api", globalLimiter);

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