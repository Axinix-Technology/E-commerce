import { getModel } from "../utils/appRegistry.js";
import { getService } from "../utils/servicesCache.js";
import { pathToFileURL } from "url";
import sanitizeWrite from "../utils/sanitizeWrite.js";

/**
 * Create Query Builder (Tracker-v2 Pattern)
 * - Sanitizes write body
 * - Discovers service lifecycle hooks (beforeCreate, afterCreate)
 * - Direct DB contact
 */
export default async function buildCreateQuery(ctx) {
  let { modelName, body, policy, user } = ctx;

  const Model = getModel(modelName);
  if (!Model) throw new Error(`Model "${modelName}" not found`);

  /** 1) Sanitize Body */
  body = sanitizeWrite({ body, policy, action: "create" });
  ctx.body = body;

  /** 2) Service Lifecycle Discovery & beforeCreate Hook */
  const modelService = getService(modelName);
  let serviceInstance = null;

  if (modelService) {
    try {
      const fileUrl = pathToFileURL(modelService).href;
      const serviceModule = await import(fileUrl);
      serviceInstance = typeof serviceModule.default === "function" ? serviceModule.default() : serviceModule.default;
    } catch (_) {}
  }

  const beforeCreate = serviceInstance?.beforeCreate;
  const afterCreate = serviceInstance?.afterCreate;

  if (typeof beforeCreate === "function") {
    const result = await beforeCreate(ctx);
    if (result && typeof result === "object") {
      body = result;
      ctx.body = result;
    }
  }

  /** 3) Direct DB Contact */
  let createdDocument;
  try {
    if (Array.isArray(body)) {
      createdDocument = await Model.insertMany(body);
    } else {
      const doc = new Model(body);
      createdDocument = await doc.save();
    }
  } catch (err) {
    if (err.code === 11000 && err.keyValue) {
      const existingDoc = await Model.findOne(err.keyValue).lean();
      if (existingDoc) return existingDoc;
    }
    throw err;
  }

  /** 4) Service Lifecycle Hook (afterCreate) */
  if (typeof afterCreate === "function") {
    ctx.docId = Array.isArray(createdDocument)
      ? createdDocument.map((doc) => doc._id.toString())
      : createdDocument._id.toString();
    ctx.data = createdDocument;
    await afterCreate(ctx);
  }

  return createdDocument;
}
