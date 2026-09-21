import sanitizeErrorResponse from "../utils/errorSanitizer.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  res.status(statusCode).json(sanitizeErrorResponse(err));
};

export default errorHandler;
