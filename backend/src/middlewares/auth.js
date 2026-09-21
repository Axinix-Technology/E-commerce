import jwt from "jsonwebtoken";
import models from "../models/Collection.js";

const Session = models.sessions;

// In-memory session validation cache (TTL: 30s)
const sessionAuthCache = new Map();
const SESSION_CACHE_TTL_MS = 30 * 1000;

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required: Bearer token missing" });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_change_me_min32chars";
    const decoded = jwt.verify(token, JWT_SECRET);

    const cacheKey = `${decoded.id}:${token}`;
    const cached = sessionAuthCache.get(cacheKey);
    const now = Date.now();

    let session = null;
    if (cached && now - cached.timestamp < SESSION_CACHE_TTL_MS) {
      session = cached.session;
    } else {
      session = await Session.findOne({
        userId: decoded.id,
        "generatedToken.token": token,
        status: "Active"
      }).lean();

      if (!session) {
        sessionAuthCache.delete(cacheKey);
        return res.status(403).json({ success: false, message: "Session expired or invalid" });
      }

      sessionAuthCache.set(cacheKey, { session, timestamp: now });
    }

    req.user = decoded;
    req.session = session;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired token", error: err.message });
  }
};

export default authMiddleware;
