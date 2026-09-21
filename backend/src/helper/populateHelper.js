import { buildQuery } from "../utils/policy/policyEngine.js";
import { parseFilter } from "../utils/filterParser.js";
import { DEFAULT_POPULATE_FIELDS } from "../Config/defaultPopulateFields.js";
import { sanitizeErrorResponse } from "../utils/errorSanitizer.js";

// Unified context helper with backward compatibility getters (Tracker-v2 Pattern)
function makeCtx({ action, modelName, docId, fields, filter, populateFields, body, page, limit, sort, user, req }) {
  const ctx = {
    action,
    modelName,
    docId,
    fields,
    filter,
    populateFields,
    body,
    page,
    limit,
    sort,
    user,
    req,
    get userId() {
      return this.user?.id;
    },
    get role() {
      return this.user?.role;
    }
  };

  Object.defineProperty(ctx, "data", {
    get() {
      return this._data;
    },
    set(val) {
      this._data = val;
    }
  });
  Object.defineProperty(ctx, "beforeDoc", {
    get() {
      return this._beforeDoc;
    },
    set(val) {
      this._beforeDoc = val;
    }
  });
  Object.defineProperty(ctx, "existingDoc", {
    get() {
      return this._existingDoc;
    },
    set(val) {
      this._existingDoc = val;
    }
  });
  Object.defineProperty(ctx, "deletedDoc", {
    get() {
      return this._deletedDoc;
    },
    set(val) {
      this._deletedDoc = val;
    }
  });

  return ctx;
}

/**
 * Universal Dynamic Dispatcher Controller (Tracker-v2 Pattern)
 * Sole Responsibility: Normalize request payload and send to Policy Engine for authorization validation & execution.
 */
export async function populateHelper(req, res, next) {
  try {
    const { action, model, id } = req.params;
    const user = req.user;

    // Determine payload source based on action type
    const isReadAction = ["read", "statistics", "report"].includes(action);
    const optionsSource = isReadAction ? { ...req.query, ...req.body } : req.query;

    const { page = 1, limit = 20, sort, type } = optionsSource;
    let { fields, filter, populateFields: rawPopulateFields } = optionsSource;

    if (!rawPopulateFields && optionsSource.populate) {
      rawPopulateFields = optionsSource.populate;
    }

    // 1. Normalize Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    // 2. Normalize Fields
    if (typeof fields === "string") {
      fields = fields
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
    }

    // 3. Normalize Sort
    let sortObj = { createdAt: -1 };
    if (sort) {
      try {
        sortObj = typeof sort === "string" ? JSON.parse(sort) : sort;
      } catch {
        // Fallback to default sort
      }
    }

    // 4. Normalize Filter
    let finalFilter = {};
    if (typeof filter === "string") {
      try {
        finalFilter = JSON.parse(filter);
      } catch {
        finalFilter = parseFilter(filter);
      }
    } else if (filter && typeof filter === "object") {
      finalFilter = filter;
    }

    // 5. Normalize Body & File Attachments
    let requestBody = req.body;
    if (requestBody && requestBody.payload && typeof requestBody.payload === "object") {
      requestBody = requestBody.payload;
    }

    if ((action === "create" || action === "update") && (req.file || req.files)) {
      const today = new Date();
      const datePath = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}`;

      const singleFile =
        req.file ||
        (req.files && req.files.file && req.files.file[0]) ||
        (req.files && req.files.profileImage && req.files.profileImage[0]) ||
        (req.files && req.files.logo && req.files.logo[0]);

      if (singleFile) {
        requestBody = {
          ...requestBody,
          filePath: `/api/files/serve/documents/${datePath}/${singleFile.filename}`
        };
      }

      if (req.files && req.files.attachments) {
        const attachmentPaths = req.files.attachments.map((file) => ({
          name: file.originalname || file.filename,
          url: `/api/files/serve/documents/${datePath}/${file.filename}`,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          uploadedAt: new Date()
        }));

        requestBody = {
          ...requestBody,
          attachments: attachmentPaths
        };
      }
    }

    // 6. Normalize Populate Fields
    let finalPopulate = { ...(DEFAULT_POPULATE_FIELDS[model] || {}) };
    if (rawPopulateFields) {
      try {
        const parsed =
          typeof rawPopulateFields === "string" && (rawPopulateFields.startsWith("{") || rawPopulateFields.startsWith("["))
            ? JSON.parse(rawPopulateFields)
            : rawPopulateFields;

        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (typeof item === "object" && item !== null && item.path) {
              finalPopulate[item.path] = item.select || "name";
            } else if (typeof item === "string") {
              finalPopulate[item] = "name";
            }
          });
        } else if (typeof parsed === "object" && parsed !== null) {
          finalPopulate = { ...finalPopulate, ...parsed };
        } else if (typeof parsed === "string") {
          parsed.split(",").forEach((pathItem) => {
            const clean = pathItem.trim();
            if (clean) finalPopulate[clean] = "name";
          });
        }
      } catch (e) {
        console.warn("Error parsing populateFields:", rawPopulateFields, e.message);
      }
    }

    // 7. Dispatch directly to Policy Engine for authorization validation & execution
    const data = await buildQuery(
      makeCtx({
        action,
        modelName: model,
        docId: id,
        fields,
        filter: finalFilter,
        populateFields: finalPopulate,
        body: requestBody,
        page: pageNum,
        limit: limitNum,
        sort: sortObj,
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          role: user?.role,
          isSuperAdmin: !!user?.isSuperAdmin
        },
        req
      })
    );

    const statusCode = action === "create" ? 201 : 200;

    return res.status(statusCode).json({
      success: true,
      count: Array.isArray(data) ? data.length : data?.pagination?.total ?? (data ? 1 : 0),
      data,
      type: type ? (parseInt(type) === 1 ? "summary" : parseInt(type) === 2 ? "detailed" : "statistics") : undefined
    });
  } catch (error) {
    const { statusCode, payload } = sanitizeErrorResponse(error, req);
    return res.status(statusCode).json(payload);
  }
}

export default populateHelper;
