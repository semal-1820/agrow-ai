/**
 * Phase 4 — Health Monitoring (Module 4)
 *
 * Mounted at the top-level GET /health (NOT /api/health — that path is
 * already used by the Enterprise Health Engine from Phase 2). This is the
 * infrastructure-level health check that a load balancer, Docker
 * healthcheck, or uptime monitor would poll.
 */

const os = require("os");
const mongoose = require("mongoose");
const axios = require("axios");

const startTime = Date.now();

async function checkMLService() {
  const url = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
  try {
    const res = await axios.get(url, { timeout: 2000 });
    return { status: "up", statusCode: res.status };
  } catch (err) {
    return { status: "down", error: err.code || err.message };
  }
}

function checkStorage() {
  try {
    const fs = require("fs");
    const path = require("path");
    const dir = process.env.REPORT_STORAGE_PATH || path.join(__dirname, "../../uploads/reports");
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return { status: "ok", path: dir };
  } catch (err) {
    return { status: "unavailable", error: err.message };
  }
}

exports.getHealth = async (req, res) => {
  const dbStateMap = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = dbStateMap[mongoose.connection.readyState] || "unknown";
  const dbHealthy = mongoose.connection.readyState === 1;

  const mlService = await checkMLService();
  const storage = checkStorage();

  const memoryUsage = process.memoryUsage();
  const cpuLoad = os.loadavg(); // [1min, 5min, 15min] — Linux/Mac only, [0,0,0] on Windows

  const overallHealthy = dbHealthy && storage.status === "ok";

  const payload = {
    status: overallHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || "development",
    database: {
      status: dbState,
      healthy: dbHealthy,
      host: mongoose.connection.host || null,
    },
    mlService,
    storage,
    memory: {
      rssMB: +(memoryUsage.rss / 1024 / 1024).toFixed(1),
      heapUsedMB: +(memoryUsage.heapUsed / 1024 / 1024).toFixed(1),
      heapTotalMB: +(memoryUsage.heapTotal / 1024 / 1024).toFixed(1),
      systemFreeMB: +(os.freemem() / 1024 / 1024).toFixed(1),
      systemTotalMB: +(os.totalmem() / 1024 / 1024).toFixed(1),
    },
    cpu: {
      loadAverage1m: cpuLoad[0],
      cores: os.cpus().length,
    },
  };

  res.status(overallHealthy ? 200 : 503).json(payload);
};
