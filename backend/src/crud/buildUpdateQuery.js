import { getModel } from "../utils/appRegistry.js";
import { getService } from "../utils/servicesCache.js";
import { pathToFileURL } from "url";
import sanitizeUpdate from "../utils/sanitizeUpdate.js";

/**
 * Update Query Builder (Tracker-v2 Pattern)
 * - Sanitizes update body via sanitizeUpdate
 * - Discovers service lifecycle hooks (beforeUpdate, afterUpdate)
 * - Direct DB contact
 */
export default async function buildUpdateQuery(ctx) {
  let { modelName, docId, filter = {}, body, policy, user } = ctx;

  const Model = getModel(modelName);
  if (!Model) throw new Error(`Model "${modelName}" not found`);

  /** 1) Sanitize Body */
  body = sanitizeUpdate({ body, policy });
  ctx.body = body;

  /** 2) Service Lifecycle Discovery & beforeUpdate Hook */
  const modelService = getService(modelName);
  let serviceInstance = null;

  if (modelService) {
    try {
      const fileUrl = pathToFileURL(modelService).href;
      const serviceModule = await import(fileUrl);
      serviceInstance = typeof serviceModule.default === "function" ? serviceModule.default() : serviceModule.default;
    } catch (_) { }
  }

  const beforeUpdate = serviceInstance?.beforeUpdate;
  const afterUpdate = serviceInstance?.afterUpdate;

  const targetFilter = docId ? { _id: docId, ...(filter || {}) } : filter || {};

  if (typeof beforeUpdate === "function") {
    const existingDoc = await Model.findOne(targetFilter).lean();
    ctx.existingDoc = existingDoc;
    const result = await beforeUpdate(ctx);
    if (result && typeof result === "object") {
      body = result;
      ctx.body = result;
    }
  }

  /** 3) Direct DB Contact */
  const updatedDoc = await Model.findOneAndUpdate(
    targetFilter,
    { $set: body },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedDoc) {
    throw new Error(`Document not found in ${modelName}`);
  }

  /** 4) Service Lifecycle Hook (afterUpdate) */
  if (typeof afterUpdate === "function") {
    ctx.data = updatedDoc;
    ctx.docId = updatedDoc._id;
    await afterUpdate(ctx);
  }

  return updatedDoc;
}
