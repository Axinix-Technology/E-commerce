import mongoose from "mongoose";

/**
 * BackupConfig Model (Tracker-v2 Architecture)
 * STRICT SCHEMA DEFINITION ONLY.
 * Stored in MongoDB collection: "backup_configs"
 * 
 * Allows Admin UI to view, create, edit, toggle, and configure automated cron backup jobs.
 */
const backupConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    cronExpression: {
      type: String,
      required: true,
      trim: true,
      default: "0 2 * * *" // 2:00 AM daily
    },
    timezone: {
      type: String,
      default: "UTC",
      trim: true
    },
    enabled: {
      type: Boolean,
      default: true
    },
    retentionDays: {
      type: Number,
      default: 14,
      min: 1
    },
    compression: {
      type: String,
      enum: ["gzip", "none"],
      default: "gzip"
    },
    targetCollections: {
      type: [String],
      default: ["*"] // ["*"] means all database collections
    },
    lastRunAt: {
      type: Date,
      default: null
    },
    nextRunAt: {
      type: Date,
      default: null
    },
    lastStatus: {
      type: String,
      enum: ["IDLE", "RUNNING", "SUCCESS", "FAILED"],
      default: "IDLE"
    },
    lastError: {
      type: String,
      default: null
    },
    lastBackupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "backups",
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast lookup and UI sorting
backupConfigSchema.index({ enabled: 1, lastStatus: 1 });
backupConfigSchema.index({ createdAt: -1 });

const BackupConfig = mongoose.model("backup_configs", backupConfigSchema);

export default BackupConfig;
