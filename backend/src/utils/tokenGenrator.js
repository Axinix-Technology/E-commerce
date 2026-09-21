import crypto from "node:crypto";
import jwt from "jsonwebtoken";

// Generate cryptographic secret
export const generateSecret = () => {
  return crypto.randomBytes(64).toString("hex");
};

// Generate short unique ID for token replay protection
export const generateJti = () => {
  return crypto.randomBytes(16).toString("hex");
};

// Issue Access Token
export const generateAccessToken = (payload) => {
  const secret = process.env.JWT_SECRET || "default_jwt_secret_change_me_min32chars";
  return jwt.sign(payload, secret, { expiresIn: "1h" });
};

// Issue Refresh Token
export const generateRefreshToken = (payload) => {
  const secret = process.env.JWT_REFRESH_SECRET || "default_jwt_refresh_secret_change_me_min32chars";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};
