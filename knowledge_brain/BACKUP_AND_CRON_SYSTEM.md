# Backup and Cron Scheduler System

## Overview

The Database Backup and Dynamic Cron Scheduler system is designed to provide full administrative control and observability directly from the platform's Admin UI. All backup configurations and execution history are persisted in dedicated MongoDB collections.

---

## Architecture & Collections

### 1. `backup_configs` Collection
Defines automated backup schedules, target collections, retention rules, and compression formats.

- **`name`**: Descriptive unique name (e.g., `"Daily Automated Backup"`).
- **`cronExpression`**: Standard 5-part cron syntax (e.g., `"0 2 * * *"` for 2:00 AM daily).
- **`timezone`**: Timezone string (default: `"UTC"`).
- **`enabled`**: Boolean toggle to pause or activate the job from UI.
- **`retentionDays`**: Days to preserve generated archives before automated pruning (default: `14`).
- **`compression`**: `"gzip"` (default) or `"none"`.
- **`targetCollections`**: Array of collection names, or `["*"]` to back up all platform collections.
- **`lastRunAt`** / **`nextRunAt`**: Execution timestamps.
- **`lastStatus`**: `"IDLE"` | `"RUNNING"` | `"SUCCESS"` | `"FAILED"`.
- **`lastError`**: Detailed error message if execution encountered an issue.
- **`lastBackupId`**: Reference to the latest generated `backups` document.

### 2. `backups` Collection
Records every backup run (both automated cron jobs and manual UI triggers).

- **`name`**: Human-readable label with timestamp.
- **`configId`**: Associated `backup_configs` ObjectId (null for manual ad-hoc backups).
- **`fileName`**: Generated archive filename (e.g., `backup_daily_automated_backup_2026-09-21T10-00-00-000Z.json.gz`).
- **`filePath`**: Storage location on the server (`database/backups/`).
- **`fileSizeBytes`** / **`fileSizeFormatted`**: Precise byte size and human-readable string (e.g., `14.2 MB`).
- **`status`**: `"PENDING"` | `"IN_PROGRESS"` | `"SUCCESS"` | `"FAILED"`.
- **`triggerType`**: `"AUTOMATIC_CRON"` | `"MANUAL_UI"`.
- **`triggeredBy`** / **`triggeredByName`**: User reference or `"System Cron"`.
- **`collections`**: Breakdown per collection with document counts.
- **`totalCollections`** / **`totalDocuments`**: Summary statistics.
- **`startedAt`** / **`completedAt`** / **`durationMs`**: Execution timing metrics.
- **`isRetained`**: Boolean flag indicating if archive file exists on disk or was pruned.

---

## Dual UI Interaction Pattern

The Admin UI interacts with the backup system through two complementary mechanisms:

### A. Generic Dynamic CRUD (`/api/populate`)
Because `backups` and `backup_configs` are registered in [`Collection.js`](file:///e:/Loigmax/E-commerce/backend/src/models/Collection.js), the UI can use standard dynamic populate requests:
- **List & Filter Schedules**: `POST /api/populate/read/backup_configs` with pagination and sorting.
- **Toggle Schedule On/Off**: `POST /api/populate/update/backup_configs/:id` with payload `{ enabled: false }`.
- **Update Cron Expression**: `POST /api/populate/update/backup_configs/:id` with payload `{ cronExpression: "0 4 * * *" }`.
- **List Execution History**: `POST /api/populate/read/backups` with filters (e.g., `{ status: "SUCCESS" }`).

### B. Dedicated Operational Endpoints (`/api/backups`)
For specialized binary and orchestration flows requiring Super Admin authorization:
- **`GET /api/backups/stats`**: Aggregated overview (total backups, storage size, document counts, running cron jobs) for dashboard widgets.
- **`POST /api/backups/trigger`**: Triggers immediate manual backup (`{ configId?: string, collections?: string[] }`).
- **`GET /api/backups/download/:id`**: Streams `.json.gz` archive directly to browser with `Content-Disposition: attachment`.
- **`POST /api/backups/reload-schedules`**: Re-syncs in-memory `node-cron` tasks with the `backup_configs` collection.
- **`DELETE /api/backups/:id`**: Safely unlinks the archive from disk and deletes the MongoDB log.

---

## Retention & Pruning

When a scheduled or manual backup completes successfully:
1. The service calculates the cutoff threshold: `Date.now() - (retentionDays * 86400000)`.
2. Any backups for that configuration older than the cutoff threshold are identified.
3. Their physical files in `database/backups/` are unlinked from disk.
4. Their database records are updated to `isRetained: false` with pruning metadata preserved for audit trails.
