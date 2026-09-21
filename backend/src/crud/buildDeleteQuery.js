import { getModel } from "../utils/appRegistry.js";
import { getService } from "../utils/servicesCache.js";
import { pathToFileURL } from "url";

/**
 * Delete Query Builder (Tracker-v2 Pattern)
 * - Discovers service lifecycle hooks (beforeDelete, afterDelete)
 * - Direct DB contact
 */
export default async function buildDeleteQuery(ctx) {
  let { modelName, docId, filter = {}, policy, user } = ctx;

  const Model = getModel(modelName);
  if (!Model) throw new Error(`Model "${modelName}" not found`);

  /** 1) Service Lifecycle Discovery & beforeDelete Hook */
  const modelService = getService(modelName);
  let serviceInstance = null;

  if (modelService) {
    try {
      const fileUrl = pathToFileURL(modelService).href;
      const serviceModule = await import(fileUrl);
      serviceInstance = typeof serviceModule.default === "function" ? serviceModule.default() : serviceModule.default;
    } catch (_) {}
  }

  const beforeDelete = serviceInstance?.beforeDelete;
  const afterDelete = serviceInstance?.afterDelete;

  const targetFilter = docId ? { _id: docId, ...(filter || {}) } : filter || {};

  if (typeof beforeDelete === "function") {
    await beforeDelete(ctx);
  }

  /** 2) Direct DB Contact (Soft-delete if schema supports, else Hard-delete) */
  const hasSoftDelete =
    Model.schema.path("isDeleted") ||
    Model.schema.path("deleted") ||
    Model.schema.path("isActive");

  let deletedDoc;
  if (hasSoftDelete) {
    const update = {};
    if (Model.schema.path("isDeleted")) update.isDeleted = true;
    if (Model.schema.path("deleted")) update.deleted = true;
    if (Model.schema.path("isActive")) update.isActive = false;
    deletedDoc = await Model.findOneAndUpdate(targetFilter, { $set: update }, { new: true }).lean();
  } else {
    deletedDoc = await Model.findOneAndDelete(targetFilter).lean();
  }

  if (!deletedDoc) {
    throw new Error(`Document not found in ${modelName}`);
  }

  /** 3) Service Lifecycle Hook (afterDelete) */
  if (typeof afterDelete === "function") {
    ctx.deletedDoc = deletedDoc;
    ctx.docId = deletedDoc._id;
    await afterDelete(ctx);
  }

  return deletedDoc;
}
