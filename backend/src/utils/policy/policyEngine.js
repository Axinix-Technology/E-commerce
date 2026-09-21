import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { getPolicy } from "../cache.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Resolves access policy:
 * 1) Super Admin -> bypass
 * 2) Other role -> verify access policy from cache
 */
export function resolvePolicy(ctx, modelName) {
  const targetModel = String(modelName).trim();

  // 1) Super Admin bypass: checked via isSuperAdmin flag
  if (ctx.user?.isSuperAdmin) {
    return {
      role: "Super Admin",
      modelName: targetModel,
      permissions: { read: true, create: true, update: true, delete: true, report: true },
      forbiddenAccess: { read: [], create: [], update: [], delete: [] },
      allowAccess: { read: ["*"], create: ["*"], update: ["*"], delete: ["*"] }
    };
  }

  // 2) Other role: verify access policy from cache
  const role = ctx.role || ctx.user?.role;
  return getPolicy(role, targetModel);
}

/**
 * Policy Engine:
 * Validates access policy and resolves right CRUD operation.
 */
export async function buildQuery(ctx) {
  const { action: rawAction, modelName } = ctx;
  const role = ctx.user?.role || ctx.role;

  const PERMISSION_ALIASES = { list: "read", statistics: "report" };
  const action = PERMISSION_ALIASES[rawAction] || rawAction;

  if (!role || !modelName) {
    throw new Error(`Role and modelName are required (role=${role}, modelName=${modelName})`);
  }

  // Validate access policy
  const policy = resolvePolicy(ctx, modelName);

  if (!policy) {
    const err = new Error(`⛔ No policy defined for role '${role}' on model '${modelName}'. Request rejected.`);
    err.status = 403;
    err.code = "POLICY_NOT_FOUND";
    throw err;
  }

  if (policy.permissions && policy.permissions[action] === false) {
    const err = new Error(`⛔ Role '${role}' has no '${action.toUpperCase()}' permission on model '${modelName}'.`);
    err.status = 403;
    err.code = "PERMISSION_DENIED";
    throw err;
  }

  ctx.policy = policy;

  // Resolve and dispatch to the right CRUD operation
  const crudFile = path.resolve(__dirname, `../../crud/build${capitalize(action)}Query.js`);
  let crudHandler;
  try {
    const imported = await import(pathToFileURL(crudFile).href);
    crudHandler = imported.default || imported;
  } catch (err) {
    throw new Error(`❌ CRUD handler not found for action '${action}' (file: ${crudFile})`);
  }

  return await crudHandler(ctx);
}

export default {
  buildQuery,
  resolvePolicy
};
