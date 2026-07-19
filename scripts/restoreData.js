/**
 * Phase 4 — Database Restore (Module 5)
 *
 * Restores a backup produced by backupData.js. Reads the JSON files
 * (source of truth — CSV is for humans, not for restoring) and inserts
 * them back into the matching collections.
 *
 * Usage:
 *   node scripts/restoreData.js <backup-folder-name>
 *   node scripts/restoreData.js 2026-07-19T15-30-00-000Z
 *
 * By default this REFUSES to overwrite a non-empty collection, to avoid
 * accidentally wiping live demo data. Pass --force to wipe and replace.
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const folderArg = process.argv[2];
const force = process.argv.includes("--force");

if (!folderArg) {
  console.error("Usage: node scripts/restoreData.js <backup-folder-name> [--force]");
  process.exit(1);
}

async function validateBackup(dir) {
  const manifestPath = path.join(dir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("manifest.json not found — this doesn't look like a valid backup folder");
  }
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

async function restore() {
  const dir = path.join(__dirname, "../backups", folderArg);
  if (!fs.existsSync(dir)) {
    throw new Error(`Backup folder not found: ${dir}`);
  }

  const manifest = await validateBackup(dir);
  await mongoose.connect(process.env.MONGO_URI);

  for (const modelName of Object.keys(manifest.collections)) {
    const jsonPath = path.join(dir, `${modelName}.json`);
    if (!fs.existsSync(jsonPath)) {
      console.warn(`⚠️  Skipping ${modelName} — ${modelName}.json missing`);
      continue;
    }

    let Model;
    try {
      Model = require(`../src/models/${modelName}`);
    } catch {
      console.warn(`⚠️  Skipping ${modelName} — model file not found`);
      continue;
    }

    const existingCount = await Model.countDocuments();
    if (existingCount > 0 && !force) {
      console.warn(
        `⚠️  Skipping ${modelName} — collection already has ${existingCount} documents. Re-run with --force to overwrite.`
      );
      continue;
    }

    const docs = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    if (force) {
      await Model.deleteMany({});
    }
    if (docs.length > 0) {
      await Model.insertMany(docs, { ordered: false });
    }
    console.log(`✅ ${modelName}: ${docs.length} documents restored`);
  }

  console.log("\n📦 Restore complete.");
  await mongoose.disconnect();
}

restore().catch((err) => {
  console.error("❌ Restore failed:", err.message);
  process.exit(1);
});
