/**
 * Production-Grade Error Sanitizer & Response Normalizer (Tracker-v2 Pattern)
 */
export function sanitizeErrorResponse(err, req) {
  const isDevMode =
    process.env.EXPOSE_DETAILED_ERRORS === "true" ||
    (process.env.NODE_ENV !== "production" && process.env.EXPOSE_DETAILED_ERRORS !== "false");

  const message = err.message || "Internal Server Error";
  const isSecurityError =
    err.status === 403 ||
    err.code === "FORBIDDEN" ||
    err.code === "PERMISSION_DENIED" ||
    err.code === "POLICY_NOT_FOUND" ||
    message.includes("ACCESS DENIED") ||
    message.includes("CRITICAL SECURITY") ||
    message.includes("permission") ||
    message.includes("No policy defined");

  let statusCode = err.status || err.statusCode;
  if (!statusCode) {
    statusCode = isSecurityError ? 403 : 500;
  }

  const requestId = req?.requestId || req?.headers?.["x-request-id"];

  if (isSecurityError) {
    return {
      statusCode: 403,
      payload: {
        success: false,
        error: isDevMode ? message : "Access Denied",
        code: err.code || "FORBIDDEN",
        ...(isDevMode && { details: message, stack: err.stack }),
        ...(requestId && { requestId })
      }
    };
  }

  if (statusCode === 400 || err.code === "BAD_REQUEST") {
    return {
      statusCode: 400,
      payload: {
        success: false,
        error: isDevMode ? message : "Bad Request",
        code: err.code || "BAD_REQUEST",
        ...(isDevMode && { details: message, stack: err.stack }),
        ...(requestId && { requestId })
      }
    };
  }

  if (statusCode === 401 || err.code === "UNAUTHORIZED") {
    return {
      statusCode: 401,
      payload: {
        success: false,
        error: isDevMode ? message : "Unauthorized",
        code: err.code || "UNAUTHORIZED",
        ...(requestId && { requestId })
      }
    };
  }

  return {
    statusCode: statusCode || 500,
    payload: {
      success: false,
      error: isDevMode ? message : "Internal Server Error",
      code: err.code || "INTERNAL_ERROR",
      ...(isDevMode && { details: message, stack: err.stack }),
      ...(requestId && { requestId })
    }
  };
}

export default sanitizeErrorResponse;
