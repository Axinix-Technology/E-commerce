import assert from "assert";
import models from "../models/Collection.js";
import { formatBytes, getBackupDirectory } from "../services/backupService.js";
import schedulerService from "../services/schedulerService.js";
import cron from "node-cron";

console.log("🧪 Starting Backup, Cron Scheduler & General Settings Verification...");

// 1. Model Registry Checks
const expectedModels = [
  "users",
  "roles",
  "sessions",
  "access_policies",
  "backups",
  "backup_configs",
  "general_settings"
];

for (const m of expectedModels) {
  assert(models[m], `Expected model "${m}" to be registered in Collection.js`);
  assert(models[m].schema, `Expected model "${m}" to have a Mongoose schema`);
}
console.log(`✅ Model Registry verified: All ${expectedModels.length} models properly registered.`);

// 2. Pure Schema Checks (no methods, no query builders in models)
assert.strictEqual(typeof models.backup_configs.schema.paths.cronExpression, "object");
assert.strictEqual(typeof models.backup_configs.schema.paths.enabled, "object");
assert.strictEqual(typeof models.backup_configs.schema.paths.retentionDays, "object");
assert.strictEqual(typeof models.backup_configs.schema.paths.targetCollections, "object");

assert.strictEqual(typeof models.backups.schema.paths.fileName, "object");
assert.strictEqual(typeof models.backups.schema.paths.fileSizeBytes, "object");
assert.strictEqual(typeof models.backups.schema.paths.status, "object");
assert.strictEqual(typeof models.backups.schema.paths.collections, "object");

assert.strictEqual(typeof models.general_settings.schema.paths.platformName, "object");
assert.strictEqual(typeof models.general_settings.schema.paths["currency.code"], "object");
assert.strictEqual(typeof models.general_settings.schema.paths["inventorySettings.lowStockThreshold"], "object");
console.log("✅ Pure Schema Definitions verified for backup_configs, backups, and general_settings.");

// 3. Backup Utilities
const backupDir = getBackupDirectory();
assert(backupDir.includes("backups"), `Backup directory path should contain 'backups': ${backupDir}`);
assert.strictEqual(formatBytes(0), "0 B");
assert.strictEqual(formatBytes(1024), "1 KB");
assert.strictEqual(formatBytes(1048576), "1 MB");
assert.strictEqual(formatBytes(1572864), "1.5 MB");
console.log("✅ Backup directory resolver & formatBytes helpers verified.");

// 4. Scheduler cron validation & register/stop
const testCronExpr = "*/15 * * * *";
assert(cron.validate(testCronExpr), "Test cron expression should be valid");

// Test dummy scheduling in memory
const dummyConfig = {
  _id: "507f191e810c19729de860ea",
  name: "Test Job",
  cronExpression: "0 4 * * *",
  timezone: "UTC",
  enabled: true
};

schedulerService.scheduleJob(dummyConfig);
assert.strictEqual(schedulerService.activeJobs.size, 1, "Expected 1 active job in scheduler");
const summary = schedulerService.getActiveJobsSummary();
assert.strictEqual(summary.length, 1);
assert.strictEqual(summary[0].name, "Test Job");

// Test stopping job
schedulerService.stopJob("507f191e810c19729de860ea");
assert.strictEqual(schedulerService.activeJobs.size, 0, "Expected 0 active jobs after stopJob");
console.log("✅ SchedulerProvider schedule/stop lifecycle verified in-memory.");

console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! Everything is verified.");
