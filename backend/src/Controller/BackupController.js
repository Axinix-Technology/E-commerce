import fs from "fs";
import models from "../models/Collection.js";
import {
  executeBackup,
  getBackupFileDownload,
  deleteBackup as deleteBackupService,
  formatBytes
} from "../services/backupService.js";
import schedulerService from "../services/schedulerService.js";

const Backup = models.backups;
const BackupConfig = models.backup_configs;

/**
 * Controller for specialized Backup operations:
 * - Manual trigger from UI
 * - Secure file download stream
 * - Dynamic cron schedule synchronization
 * - High-level system backup dashboard statistics
 */
export const triggerManualBackup = async (req, res, next) => {
  try {
    const { configId, collections } = req.body || {};

    const backupResult = await executeBackup({
      configId: configId || null,
      triggerType: "MANUAL_UI",
      triggeredBy: req.user?._id || null,
      triggeredByName: req.user?.name || "UI Administrator",
      customCollections: collections || null
    });

    res.status(200).json({
      success: true,
      message: "Manual database backup completed successfully",
      data: backupResult
    });
  } catch (err) {
    next(err);
  }
};

export const downloadBackup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { filePath, fileName, fileSizeBytes, backup } = await getBackupFileDownload(id);

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader(
      "Content-Type",
      backup.compression === "gzip" ? "application/gzip" : "application/json"
    );
    res.setHeader("Content-Length", fileSizeBytes);

    const readStream = fs.createReadStream(filePath);
    readStream.on("error", (streamErr) => {
      next(streamErr);
    });

    readStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

export const reloadSchedules = async (req, res, next) => {
  try {
    const result = await schedulerService.reloadSchedules();
    res.status(200).json({
      success: true,
      message: "Backup cron schedules successfully re-synchronized from database collection",
      data: result
    });
  } catch (err) {
    next(err);
  }
};

export const getBackupStats = async (req, res, next) => {
  try {
    const [
      totalBackups,
      successCount,
      failedCount,
      activeConfigsCount,
      latestBackup,
      storageAggregate
    ] = await Promise.all([
      Backup.countDocuments(),
      Backup.countDocuments({ status: "SUCCESS" }),
      Backup.countDocuments({ status: "FAILED" }),
      BackupConfig.countDocuments({ enabled: true }),
      Backup.findOne().sort({ createdAt: -1 }),
      Backup.aggregate([
        { $match: { status: "SUCCESS" } },
        { $group: { _id: null, totalSize: { $sum: "$fileSizeBytes" }, totalDocs: { $sum: "$totalDocuments" } } }
      ])
    ]);

    const totalBytes = storageAggregate[0]?.totalSize || 0;
    const totalDocsBackedUp = storageAggregate[0]?.totalDocs || 0;

    res.status(200).json({
      success: true,
      data: {
        totalBackups,
        successCount,
        failedCount,
        activeConfigsCount,
        totalStorageBytes: totalBytes,
        totalStorageFormatted: formatBytes(totalBytes),
        totalDocsBackedUp,
        latestBackup: latestBackup
          ? {
              _id: latestBackup._id,
              name: latestBackup.name,
              status: latestBackup.status,
              createdAt: latestBackup.createdAt,
              fileSizeFormatted: latestBackup.fileSizeFormatted,
              totalDocuments: latestBackup.totalDocuments
            }
          : null,
        activeRunningCronJobs: schedulerService.getActiveJobsSummary()
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBackupItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteBackupService(id);
    res.status(200).json({
      success: true,
      message: "Backup record and physical file deleted successfully",
      data: result
    });
  } catch (err) {
    next(err);
  }
};
