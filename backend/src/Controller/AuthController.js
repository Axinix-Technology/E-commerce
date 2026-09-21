import jwt from "jsonwebtoken";
import models from "../models/Collection.js";
import { generateAccessToken, generateRefreshToken, generateJti } from "../utils/tokenGenrator.js";

const User = models.users;
const Session = models.sessions;

/**
 * Login handler
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { username, password, platform = "web" } = req.body;
    const deviceUUID = req.headers["x-device-uuid"] || req.headers["deviceuuid"] || "default-device";

    const identifier = (username || "").toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    if (user.status !== "Active") {
      return res.status(403).json({ success: false, message: `Account is ${user.status}. Contact Super Admin.` });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokenPayload = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      role: user.role,
      isSuperAdmin: !!user.isSuperAdmin
    };

    const token = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const jti = generateJti();

    // Persist Session
    await Session.create({
      userId: user._id,
      generatedToken: {
        token,
        jti
      },
      refreshToken,
      deviceInfo: {
        deviceUUID,
        platform,
        userAgent: req.headers["user-agent"] || "unknown",
        ipAddress: req.ip || req.connection?.remoteAddress || "unknown"
      },
      status: "Active",
      lastUsedAt: new Date()
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        isSuperAdmin: !!user.isSuperAdmin,
        status: user.status
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, message: "Login failed", error: err.message });
  }
};

/**
 * Get authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        isSuperAdmin: !!user.isSuperAdmin,
        status: user.status,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch profile", error: err.message });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required" });
    }

    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_jwt_refresh_secret_change_me_min32chars";
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const session = await Session.findOne({
      userId: decoded.id,
      refreshToken,
      status: "Active"
    });

    if (!session) {
      return res.status(403).json({ success: false, message: "Refresh token invalid or session revoked" });
    }

    const newToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      isSuperAdmin: !!decoded.isSuperAdmin
    });

    session.generatedToken.token = newToken;
    session.lastUsedAt = new Date();
    await session.save();

    return res.status(200).json({
      success: true,
      token: newToken
    });
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid refresh token", error: err.message });
  }
};

/**
 * Logout handler
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (token) {
      await Session.updateOne(
        { "generatedToken.token": token },
        { status: "DeActive", lastUsedAt: new Date() }
      );
    }

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Logout failed", error: err.message });
  }
};

export default {
  login,
  getMe,
  refresh,
  logout
};
