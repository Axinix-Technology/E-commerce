import { getModel } from "../utils/appRegistry.js";
import { getService } from "../utils/servicesCache.js";
import { pathToFileURL } from "url";
import sanitizeRead from "../utils/sanitizeRead.js";
import { DEFAULT_POPULATE_FIELDS } from "../Config/defaultPopulateFields.js";

/**
 * Read Query Builder (Tracker-v2 Pattern)
 * - Sanitizes read fields via sanitizeRead
 * - Discovers service lifecycle hooks (beforeRead, afterRead)
 * - Direct DB contact
 */
export default async function buildReadQuery(ctx) {
  let { modelName, docId, filter = {}, fields, populateFields, policy, user, page = 1, limit = 20, sort = { createdAt: -1 } } = ctx;

  const Model = getModel(modelName);
  if (!Model) throw new Error(`Model "${modelName}" not found`);

  /** 1) Sanitize Fields */
  fields = sanitizeRead({ fields, policy });
  ctx.fields = fields;

  /** 2) Service Lifecycle Discovery & beforeRead Hook */
  const modelService = getService(modelName);
  let serviceInstance = null;

  if (modelService) {
    try {
      const fileUrl = pathToFileURL(modelService).href;
      const serviceModule = await import(fileUrl);
      serviceInstance = typeof serviceModule.default === "function" ? serviceModule.default() : serviceModule.default;
    } catch (_) {}

    if (typeof serviceInstance?.beforeRead === "function") {
      const hook = await serviceInstance.beforeRead(ctx);
      if (hook?.filter) {
        filter = hook.filter;
        ctx.filter = hook.filter;
      }
      if (hook?.fields) {
        fields = hook.fields;
        ctx.fields = hook.fields;
      }
    }
  }

  /** 3) Direct DB Contact */
  const pop = populateFields || DEFAULT_POPULATE_FIELDS[modelName];

  // Single document query by ID
  if (docId) {
    let query = Model.findById(docId);
    if (fields && !fields.includes("*")) query = query.select(fields.join(" "));
    if (pop) query = query.populate(pop);
    let result = await query.lean();

    if (typeof serviceInstance?.afterRead === "function") {
      ctx.data = result;
      result = (await serviceInstance.afterRead(ctx)) || ctx.data || result;
    }

    return result;
  }

  // Paginated list query
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  let query = Model.find(filter);
  if (fields && !fields.includes("*")) query = query.select(fields.join(" "));
  if (pop) query = query.populate(pop);

  query = query.sort(sort).skip(skip).limit(limitNum);

  const [data, total] = await Promise.all([
    query.lean(),
    Model.countDocuments(filter)
  ]);

  let finalData = data;
  if (typeof serviceInstance?.afterRead === "function") {
    ctx.data = finalData;
    finalData = (await serviceInstance.afterRead(ctx)) || ctx.data || finalData;
  }

  return {
    data: finalData,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  };
}
