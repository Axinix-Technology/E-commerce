import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  triggerManualBackup,
  downloadBackup,
  reloadSchedules,
  getBackupStats,
  deleteBackupItem
} from "../Controller/BackupController.js";

const router = express.Router();

/**
 * Super Admin authorization guard for backup operational routes.
 */
const requireBackupAdmin = (req, res, next) => {
  if (!req.user?.isSuperAdmin && req.user?.role !== "Super Admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Super Admin privileges required for database backup operations"
    });
  }
  next();
};

router.use(authMiddleware);
router.use(requireBackupAdmin);

// Specialized Backup Operational Endpoints
router.get("/stats", getBackupStats);
router.post("/trigger", triggerManualBackup);
router.get("/download/:id", downloadBackup);
router.post("/reload-schedules", reloadSchedules);
router.delete("/:id", deleteBackupItem);

export default router;
