import cron from "node-cron";
import models from "../models/Collection.js";
import { executeBackup } from "./backupService.js";

const BackupConfig = models.backup_configs;

/**
 * Dynamic Scheduler Provider
 * Synchronizes in-memory node-cron jobs with the MongoDB 'backup_configs' collection.
 * Allows changing schedules, toggling enabled/disabled, and adding new jobs directly via UI.
 */
class SchedulerService {
  constructor() {
    this.activeJobs = new Map(); // Map<configIdString, cronTask>
    this.isInitialized = false;
  }

  /**
   * Initializes all enabled backup cron jobs from the database collection.
   */
  async initScheduler() {
    try {
      console.log("⏰ Initializing Backup Cron Scheduler from database collection...");
      const enabledConfigs = await BackupConfig.find({ enabled: true });

      for (const config of enabledConfigs) {
        this.scheduleJob(config);
      }

      this.isInitialized = true;
      console.log(`✅ Backup Scheduler active: ${this.activeJobs.size} scheduled job(s) running.`);
    } catch (err) {
      console.error("❌ Failed to initialize Backup Cron Scheduler:", err);
    }
  }

  /**
   * Registers a single cron task for a given BackupConfig document.
   */
  scheduleJob(config) {
    const configId = config._id.toString();

    // Stop existing task if already running
    this.stopJob(configId);

    if (!config.enabled) {
      return;
    }

    const { cronExpression, name, timezone } = config;

    if (!cron.validate(cronExpression)) {
      console.error(`⛔ Invalid cron expression "${cronExpression}" for backup config "${name}" (${configId})`);
      return;
    }

    try {
      const task = cron.schedule(
        cronExpression,
        async () => {
          console.log(`🚀 [Cron Trigger] Starting automated backup: "${name}" (${configId})`);
          try {
            await executeBackup({
              configId: config._id,
              triggerType: "AUTOMATIC_CRON",
              triggeredByName: `Cron (${name})`
            });
            console.log(`✅ [Cron Completed] Backup "${name}" finished successfully.`);
          } catch (err) {
            console.error(`❌ [Cron Error] Backup "${name}" failed:`, err.message);
          }
        },
        {
          scheduled: true,
          timezone: timezone || "UTC"
        }
      );

      this.activeJobs.set(configId, {
        task,
        configId,
        name,
        cronExpression,
        timezone: timezone || "UTC",
        startedAt: new Date()
      });

      console.log(`📅 Scheduled job registered: "${name}" [${cronExpression}]`);
    } catch (err) {
      console.error(`❌ Error scheduling cron job "${name}":`, err);
    }
  }

  /**
   * Stops and unregisters a scheduled cron task.
   */
  stopJob(configId) {
    const idStr = configId.toString();
    const existing = this.activeJobs.get(idStr);
    if (existing) {
      existing.task.stop();
      this.activeJobs.delete(idStr);
      console.log(`⏹️ Stopped scheduled job: "${existing.name}" (${idStr})`);
      return true;
    }
    return false;
  }

  /**
   * Reschedules a job by fetching its latest state from the database.
   */
  async rescheduleJob(configId) {
    const config = await BackupConfig.findById(configId);
    if (!config) {
      this.stopJob(configId);
      return false;
    }

    if (!config.enabled) {
      this.stopJob(configId);
      return false;
    }

    this.scheduleJob(config);
    return true;
  }

  /**
   * Reloads all schedules from the MongoDB 'backup_configs' collection.
   * Call this when configs are created/updated in bulk or on demand from UI.
   */
  async reloadSchedules() {
    console.log("🔄 Reloading all backup cron schedules from database collection...");
    // Stop all current jobs
    for (const [id] of this.activeJobs) {
      this.stopJob(id);
    }

    // Re-initialize from DB
    await this.initScheduler();
    return {
      success: true,
      activeJobsCount: this.activeJobs.size,
      jobs: this.getActiveJobsSummary()
    };
  }

  /**
   * Returns metadata of all currently active in-memory cron schedules.
   */
  getActiveJobsSummary() {
    const summary = [];
    for (const [configId, item] of this.activeJobs) {
      summary.push({
        configId,
        name: item.name,
        cronExpression: item.cronExpression,
        timezone: item.timezone,
        startedAt: item.startedAt
      });
    }
    return summary;
  }
}

// Singleton instance
const schedulerService = new SchedulerService();

export default schedulerService;
