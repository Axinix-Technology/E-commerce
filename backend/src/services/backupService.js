import fs from "fs";
import path from "path";
import zlib from "zlib";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import mongoose from "mongoose";
import models from "../models/Collection.js";

const Backup = models.backups;
const BackupConfig = models.backup_configs;

/**
 * Resolves the absolute directory where backups are stored.
 * Checks BACKUP_DIR env variable, or defaults to repo-level 'database/backups'.
 */
export function getBackupDirectory() {
  if (process.env.BACKUP_DIR) {
    return path.resolve(process.env.BACKUP_DIR);
  }
  // Try relative from current working directory (whether in backend/ or root)
  const cwd = process.cwd();
  if (path.basename(cwd) === "backend") {
    return path.resolve(cwd, "..", "database", "backups");
  }
  return path.resolve(cwd, "database", "backups");
}

/**
 * Format bytes into human-readable strings (KB, MB, GB).
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Cross-platform native streaming backup engine.
 * Dumps MongoDB collections into compressed .json.gz or plain .json
 * and records full lifecycle details in the 'backups' collection.
 */
export async function executeBackup({
  configId = null,
  triggerType = "AUTOMATIC_CRON",
  triggeredBy = null,
  triggeredByName = "System Cron",
  customCollections = null
} = {}) {
  const startTime = Date.now();
  const backupDir = getBackupDirectory();

  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 1. Fetch Config if associated
  let configDoc = null;
  if (configId) {
    configDoc = await BackupConfig.findById(configId);
  }

  const configName = configDoc?.name || (triggerType === "MANUAL_UI" ? "Manual UI Backup" : "Ad-hoc Backup");
  const compression = configDoc?.compression || "gzip";
  const retentionDays = configDoc?.retentionDays || 14;

  const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
  const sanitizedConfigName = configName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const fileExt = compression === "gzip" ? ".json.gz" : ".json";
  const fileName = `backup_${sanitizedConfigName}_${timestampStr}${fileExt}`;
  const filePath = path.join(backupDir, fileName);

  // 2. Initialize Backup Record in Database (IN_PROGRESS)
  const backupRecord = new Backup({
    name: `${configName} (${new Date().toLocaleString()})`,
    configId: configDoc?._id || null,
    configName,
    fileName,
    filePath,
    compression,
    status: "IN_PROGRESS",
    triggerType,
    triggeredBy,
    triggeredByName,
    startedAt: new Date(startTime)
  });
  await backupRecord.save();

  if (configDoc) {
    await BackupConfig.findByIdAndUpdate(configDoc._id, {
      lastStatus: "RUNNING",
      lastError: null
    });
  }

  try {
    // 3. Determine Target Collections
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("MongoDB database connection is not established");
    }

    let collectionNames = [];
    const specifiedList = customCollections || configDoc?.targetCollections || ["*"];

    if (specifiedList.includes("*")) {
      const allCols = await db.listCollections().toArray();
      collectionNames = allCols
        .map((c) => c.name)
        .filter((name) => !name.startsWith("system."));
    } else {
      collectionNames = specifiedList;
    }

    // 4. Stream and Dump Collections
    const writeStream = fs.createWriteStream(filePath);
    const gzip = compression === "gzip" ? zlib.createGzip({ level: 6 }) : null;
    const destination = gzip ? gzip.pipe(writeStream) : writeStream;

    // Write file header
    const backupHeader = {
      meta: {
        platform: "Centralized E-commerce Platform",
        version: "1.0.0",
        configName,
        triggerType,
        createdAt: new Date().toISOString()
      },
      collections: collectionNames
    };

    destination.write(`{"header":${JSON.stringify(backupHeader)},"data":{`);

    const collectionSummaries = [];
    let totalDocsCount = 0;

    for (let cIdx = 0; cIdx < collectionNames.length; cIdx++) {
      const colName = collectionNames[cIdx];
      const col = db.collection(colName);
      const docCount = await col.countDocuments();
      totalDocsCount += docCount;

      collectionSummaries.push({
        name: colName,
        count: docCount,
        sizeBytes: 0 // Approximate or updated later
      });

      // Write collection key
      destination.write(`${JSON.stringify(colName)}:[`);

      const cursor = col.find({});
      let isFirstDoc = true;

      for await (const doc of cursor) {
        if (!isFirstDoc) {
          destination.write(",");
        }
        destination.write(JSON.stringify(doc));
        isFirstDoc = false;
      }

      destination.write("]");
      if (cIdx < collectionNames.length - 1) {
        destination.write(",");
      }
    }

    // Close JSON structure
    destination.write("}}");
    destination.end();

    // Wait for stream completion
    await new Promise((resolve, reject) => {
      if (gzip) {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
        gzip.on("error", reject);
      } else {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      }
    });

    // 5. Calculate File Stats
    const stats = fs.statSync(filePath);
    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // 6. Update Backup Record (SUCCESS)
    backupRecord.status = "SUCCESS";
    backupRecord.completedAt = new Date(endTime);
    backupRecord.durationMs = durationMs;
    backupRecord.fileSizeBytes = stats.size;
    backupRecord.fileSizeFormatted = formatBytes(stats.size);
    backupRecord.collections = collectionSummaries;
    backupRecord.totalCollections = collectionSummaries.length;
    backupRecord.totalDocuments = totalDocsCount;
    backupRecord.error = null;
    await backupRecord.save();

    // 7. Update Config Document
    if (configDoc) {
      await BackupConfig.findByIdAndUpdate(configDoc._id, {
        lastRunAt: new Date(endTime),
        lastStatus: "SUCCESS",
        lastError: null,
        lastBackupId: backupRecord._id
      });

      // 8. Enforce Retention Policy
      await enforceRetention(configDoc._id, retentionDays);
    }

    return backupRecord;
  } catch (err) {
    const endTime = Date.now();
    backupRecord.status = "FAILED";
    backupRecord.completedAt = new Date(endTime);
    backupRecord.durationMs = endTime - startTime;
    backupRecord.error = err.message || "Unknown backup error";
    await backupRecord.save();

    if (configDoc) {
      await BackupConfig.findByIdAndUpdate(configDoc._id, {
        lastRunAt: new Date(endTime),
        lastStatus: "FAILED",
        lastError: err.message
      });
    }

    // Clean up partial file if failed
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanErr) {
        // ignore unlink error on fail
      }
    }

    throw err;
  }
}

/**
 * Deletes backup files exceeding retention period and marks records as pruned.
 */
export async function enforceRetention(configId, retentionDays = 14) {
  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const expiredBackups = await Backup.find({
      configId,
      isRetained: true,
      startedAt: { $lt: cutoffDate }
    });

    for (const b of expiredBackups) {
      if (b.filePath && fs.existsSync(b.filePath)) {
        try {
          fs.unlinkSync(b.filePath);
        } catch (e) {
          console.warn(`Could not delete pruned backup file: ${b.filePath}`);
        }
      }
      b.isRetained = false;
      b.metadata = { ...b.metadata, prunedAt: new Date() };
      await b.save();
    }
  } catch (err) {
    console.error("Retention enforcement error:", err);
  }
}

/**
 * Returns safe file path and backup metadata for secure file downloads.
 * Prevents directory traversal.
 */
export async function getBackupFileDownload(backupId) {
  const backup = await Backup.findById(backupId);
  if (!backup) {
    throw new Error("Backup not found");
  }

  const backupDir = getBackupDirectory();
  const safeResolvedPath = path.resolve(backup.filePath);

  // Security Check: Path must be strictly within the configured backup directory
  if (!safeResolvedPath.startsWith(backupDir)) {
    throw new Error("Access denied: Invalid backup file path");
  }

  if (!fs.existsSync(safeResolvedPath)) {
    throw new Error("Physical backup file does not exist on disk");
  }

  return {
    backup,
    filePath: safeResolvedPath,
    fileName: backup.fileName,
    fileSizeBytes: backup.fileSizeBytes
  };
}

/**
 * Deletes a backup record from DB and its physical file from disk.
 */
export async function deleteBackup(backupId) {
  const backup = await Backup.findById(backupId);
  if (!backup) {
    throw new Error("Backup not found");
  }

  if (backup.filePath && fs.existsSync(backup.filePath)) {
    try {
      fs.unlinkSync(backup.filePath);
    } catch (err) {
      console.warn(`Failed to delete file ${backup.filePath}:`, err);
    }
  }

  await Backup.findByIdAndDelete(backupId);
  return { success: true, deletedId: backupId };
}
