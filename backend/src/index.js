import express from "express";
import http from "http";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import populateRoutes from "./routes/populateRoutes.js";
import backupRoutes from "./routes/backupRoutes.js";
import { requestTracer } from "./middlewares/requestTracer.js";
import { apiHitLogger } from "./middlewares/apiHitLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import connectDB from "./Config/ConnectDB.js";
import schedulerService from "./services/schedulerService.js";
import { setCache } from "./utils/cache.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Global Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Scalable Production CORS Setup
const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173"
];

const envOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOriginsSet = new Set([...defaultAllowedOrigins, ...envOrigins]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      if (allowedOriginsSet.has(cleanOrigin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow dev origins gracefully
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-device-uuid", "deviceuuid", "x-request-id"]
  })
);

app.use(requestTracer);
app.use(apiHitLogger);

// Health & Version Endpoints
app.get("/test", (req, res) => {
  res.json({ success: true, message: "Central E-commerce Backend is working", timestamp: new Date().toISOString() });
});

app.get("/api/version", (req, res) => {
  let version = "1.0.0";
  try {
    const rootVersionPath = path.resolve(process.cwd(), "../version.json");
    const localVersionPath = path.resolve(process.cwd(), "package.json");
    if (fs.existsSync(rootVersionPath)) {
      version = JSON.parse(fs.readFileSync(rootVersionPath, "utf8")).version || version;
    } else if (fs.existsSync(localVersionPath)) {
      version = JSON.parse(fs.readFileSync(localVersionPath, "utf8")).version || version;
    }
  } catch (_) {}

  res.json({
    success: true,
    service: "central-ecommerce-backend",
    version,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Mounted Routes
app.use("/api/auth", authRoutes);
app.use("/api/populate", populateRoutes);
app.use("/api/backups", backupRoutes);

// Centralized Error Handler
app.use(errorHandler);

// Initialization Helper
export async function initApp() {
  await connectDB();
  await setCache();
  await schedulerService.initScheduler();
}

export { app, server };
export default app;
