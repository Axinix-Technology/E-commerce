import express from "express";
import { login, getMe, refresh, logout } from "../Controller/AuthController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Public Authentication Endpoints
router.post("/login", login);
router.post("/refresh", refresh);

// Protected Authentication Endpoints
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

export default router;
