import users from "./User.js";
import roles from "./Role.js";
import sessions from "./Session.js";
import access_policies from "./AccessPolicies.js";
import backups from "./Backup.js";
import backup_configs from "./BackupConfig.js";
import general_settings from "./GeneralSettings.js";

/**
 * Central Model Registry (Tracker-v2 Architecture)
 * All Mongoose models are registered here and exposed as a single object dictionary.
 */
const models = {
  users,
  roles,
  sessions,
  access_policies,
  backups,
  backup_configs,
  general_settings
};

export default models;
