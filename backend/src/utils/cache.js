import models from "../models/Collection.js";

const cache = new Map();
let cacheInitialized = false;

/**
 * Loads all AccessPolicies and Roles from database into in-memory cache.
 */
export async function setCache() {
  try {
    const AccessPolicyModel = models.access_policies;
    const RoleModel = models.roles;

    if (!AccessPolicyModel || !RoleModel) return;

    const [policies, roles] = await Promise.all([
      AccessPolicyModel.find({}).lean(),
      RoleModel.find({}).lean()
    ]);

    const roleIdToNameMap = new Map();
    roles.forEach((r) => {
      if (r._id && r.name) {
        roleIdToNameMap.set(r._id.toString(), r.name);
      }
    });

    cache.clear();

    policies.forEach((p) => {
      if (!p.role) return;
      const roleId = p.role.toString();
      const roleName = roleIdToNameMap.get(roleId);

      const permissionsObj = {};
      if (Array.isArray(p.actions)) {
        p.actions.forEach((act) => {
          permissionsObj[act] = true;
        });
      }
      ["read", "create", "update", "delete", "report"].forEach((act) => {
        if (permissionsObj[act] === undefined) {
          permissionsObj[act] = false;
        }
      });

      const policyItem = {
        ...p,
        permissions: permissionsObj
      };

      // Index by roleId
      if (!cache.has(roleId)) cache.set(roleId, {});
      cache.get(roleId)[p.modelName] = policyItem;
      cache.get(roleId)[p.modelName.toLowerCase()] = policyItem;

      // Index by roleName
      if (roleName) {
        if (!cache.has(roleName)) cache.set(roleName, {});
        if (!cache.has(roleName.toLowerCase())) cache.set(roleName.toLowerCase(), {});

        cache.get(roleName)[p.modelName] = policyItem;
        cache.get(roleName)[p.modelName.toLowerCase()] = policyItem;
        cache.get(roleName.toLowerCase())[p.modelName] = policyItem;
        cache.get(roleName.toLowerCase())[p.modelName.toLowerCase()] = policyItem;
      }
    });

    cacheInitialized = true;
  } catch (error) {
    console.error("[cache] Error initializing policy cache:", error.message);
  }
}

/**
 * Retrieves access policy from in-memory cache for a given role and model.
 */
export function getPolicy(role, modelName) {
  try {
    if (!cacheInitialized || !role || !modelName) return null;

    const roleStr = String(role).trim();
    const targetModel = String(modelName).trim();

    const roleCache = cache.get(roleStr) || cache.get(roleStr.toLowerCase());
    if (!roleCache) return null;

    return roleCache[targetModel] || roleCache[targetModel.toLowerCase()] || null;
  } catch {
    return null;
  }
}

export default {
  setCache,
  getPolicy
};
