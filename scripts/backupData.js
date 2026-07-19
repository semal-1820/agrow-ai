/**
 * Phase 4 — Database Backup (Module 5)
 *
 * Exports every collection to JSON (full fidelity) and CSV (for opening
 * in Excel/Sheets during a demo or judge review). No external/paid backup
 * service required — this talks to your existing MONGO_URI directly via
 * the same Mongoose models the app already uses.
 *
 * Usage:
 *   node scripts/backupData.js
 *
 * Output:
 *   backend/backups/<timestamp>/*.json
 *   backend/backups/<timestamp>/*.csv
 *
 * Schedule this with a cron job (Linux) or Task Scheduler (Windows) for
 * automatic periodic backups, e.g.:
 *   0 2 * * *  cd /path/to/backend && node scripts/backupData.js
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const MODELS = [
  "User",
  "Enterprise",
  "FinancialRecord",
  "ForecastResult",
  "RiskAssessment",
  "GovernmentScheme",
  "SchemeApplication",
  "Report",
  "Notification",
];

function toCsv(rows) {
  if (rows.length === 0) return "";

  const columns = new Set();
  rows.forEach((row) => Object.keys(row).forEach((key) => columns.add(key)));
  const headers = Array.from(columns);

  const escape = (val) => {
    if (val === null || val === undefined) return "";
    const str =
      typeof val === "object" ? JSON.stringify(val) : String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  });
  return lines.join("\n");
}

async function backup() {
  await mongoose.connect(process.env.MONGO_URI);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.join(__dirname, "../backups", stamp);
  fs.mkdirSync(outDir, { recursive: true });

  const manifest = { createdAt: new Date().toISOString(), collections: {} };

  for (const modelName of MODELS) {
    let Model;
    try {
      Model = require(`../src/models/${modelName}`);
    } catch {
      console.warn(`⚠️  Skipping ${modelName} — model file not found`);
      continue;
    }

    const docs = await Model.find({}).lean();
    const plain = JSON.parse(JSON.stringify(docs));

    fs.writeFileSync(
      path.join(outDir, `${modelName}.json`),
      JSON.stringify(plain, null, 2)
    );
    fs.writeFileSync(path.join(outDir, `${modelName}.csv`), toCsv(plain));

    manifest.collections[modelName] = docs.length;
    console.log(`✅ ${modelName}: ${docs.length} documents backed up`);
  }

  fs.writeFileSync(
    path.join(outDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\n📦 Backup complete: ${outDir}`);
  await mongoose.disconnect();
}

backup().catch((err) => {
  console.error("❌ Backup failed:", err.message);
  process.exit(1);
});
