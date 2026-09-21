import { getModel } from "../utils/appRegistry.js";
import { getService } from "../utils/servicesCache.js";
import { pathToFileURL } from "url";
import safeAggregate from "../utils/safeAggregator.js";

/**
 * Report Query Builder (Tracker-v2 Pattern)
 * - Discovers service lifecycle hooks (beforeReport, afterReport)
 * - Enforces safe aggregation via safeAggregate
 * - Direct DB contact
 */
export default async function buildReportQuery(ctx) {
  let { modelName, filter = {}, fields, populateFields, body = {}, policy, user } = ctx;

  const Model = getModel(modelName);
  if (!Model) throw new Error(`Model "${modelName}" not found`);

  /** 1) Service Lifecycle Discovery & beforeReport Hook */
  const modelService = getService(modelName);
  let serviceInstance = null;

  if (modelService) {
    try {
      const fileUrl = pathToFileURL(modelService).href;
      const serviceModule = await import(fileUrl);
      serviceInstance = typeof serviceModule.default === "function" ? serviceModule.default() : serviceModule.default;
    } catch (_) {}

    if (typeof serviceInstance?.beforeReport === "function") {
      const hook = await serviceInstance.beforeReport(ctx);
      if (hook?.data !== undefined) return hook.data;
      if (hook?.filter) filter = hook.filter;
      if (hook?.pipeline) ctx.pipeline = hook.pipeline;
      if (hook?.fields) fields = hook.fields;
    }
  }

  /** 2) Pipeline Assembly */
  const pipeline = [];

  // Match stage
  const baseMatch = normalizeReportFilter(filter, Model);
  if (Object.keys(baseMatch).length > 0) {
    pipeline.push({ $match: baseMatch });
  }

  // Date range stage
  if (body.dateRange || filter.dateRange) {
    const dr = body.dateRange || filter.dateRange;
    const { startDate, endDate, dateField = "createdAt" } = dr;
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      pipeline.push({ $match: { [dateField]: dateFilter } });
    }
  }

  // Explicit pipeline stages from service hook or payload
  const givenStages = ctx.pipeline || filter.stages || body.stages;
  if (Array.isArray(givenStages) && givenStages.length > 0) {
    pipeline.push(...givenStages);
  }

  // GroupBy / Aggregation helpers
  if (body.groupBy && (!givenStages || givenStages.length === 0)) {
    const groupStage = {
      _id: `$${body.groupBy}`,
      count: { $sum: 1 }
    };
    if (body.sum) {
      const sumFields = Array.isArray(body.sum) ? body.sum : [body.sum];
      sumFields.forEach((f) => {
        groupStage[f] = { $sum: `$${f}` };
      });
    }
    pipeline.push({ $group: groupStage });
    pipeline.push({ $sort: { count: -1 } });
  }

  if (body.sort) pipeline.push({ $sort: body.sort });
  if (body.skip) pipeline.push({ $skip: parseInt(body.skip) });
  if (body.limit) pipeline.push({ $limit: parseInt(body.limit) });

  /** 3) Direct DB Contact via safeAggregate */
  let result = await safeAggregate(Model, pipeline);

  /** 4) Service Lifecycle Hook (afterReport) */
  if (typeof serviceInstance?.afterReport === "function") {
    ctx.data = result;
    result = await serviceInstance.afterReport(ctx);
  }

  return result;
}

function normalizeReportFilter(rawFilter, Model) {
  if (!rawFilter || typeof rawFilter !== "object") return {};
  const cleaned = {};

  for (const [key, val] of Object.entries(rawFilter)) {
    if (val === "all" || val === "undefined" || val === "null" || val === "" || val === null || val === undefined) {
      continue;
    }
    cleaned[key] = val;
  }

  return cleaned;
}
