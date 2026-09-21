import mongoose from "mongoose";

/**
 * Backup Model (Tracker-v2 Architecture)
 * STRICT SCHEMA DEFINITION ONLY.
 * Stored in MongoDB collection: "backups"
 * 
 * Records every automated or manual backup execution, file sizes, document counts,
 * durations, and execution errors for full UI observability and management.
 */
const backupCollectionItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    },
    sizeBytes: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const backupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    configId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "backup_configs",
      default: null,
    },
    configName: {
      type: String,
      default: "Manual Ad-hoc Backup",
      trim: true
    },
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    filePath: {
      type: String,
      required: true,
      trim: true
    },
    fileSizeBytes: {
      type: Number,
      default: 0
    },
    fileSizeFormatted: {
      type: String,
      default: "0 B"
    },
    compression: {
      type: String,
      enum: ["gzip", "none"],
      default: "gzip"
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    triggerType: {
      type: String,
      enum: ["AUTOMATIC_CRON", "MANUAL_UI", "API_TRIGGER"],
      default: "AUTOMATIC_CRON",
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null
    },
    triggeredByName: {
      type: String,
      default: "System Cron",
      trim: true
    },
    collections: {
      type: [backupCollectionItemSchema],
      default: []
    },
    totalCollections: {
      type: Number,
      default: 0
    },
    totalDocuments: {
      type: Number,
      default: 0
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    },
    durationMs: {
      type: Number,
      default: 0
    },
    error: {
      type: String,
      default: null
    },
    isRetained: {
      type: Boolean,
      default: true,
      index: true
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

// Indexes for UI pagination, sorting, and retention queries
backupSchema.index({ createdAt: -1 });
backupSchema.index({ status: 1, triggerType: 1 });
backupSchema.index({ configId: 1, startedAt: -1 });

const Backup = mongoose.model("backups", backupSchema);

export default Backup;
