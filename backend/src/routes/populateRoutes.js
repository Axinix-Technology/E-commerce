import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { populateHelper } from "../helper/populateHelper.js";
import { upload } from "../middlewares/multerConfig.js";

const router = express.Router();

/**
 * Universal Dynamic Route (Tracker-v2 Architecture)
 * One Router for all models and all actions.
 */

// Route without document ID: /api/populate/:action/:model
router.all(
    "/:action/:model",
    authMiddleware,
    upload.fields([
        { name: "file", maxCount: 1 },
        { name: "profileImage", maxCount: 1 },
        { name: "logo", maxCount: 1 },
        { name: "attachments", maxCount: 10 },
        { name: "product-image", maxCount: 10 }
    ]),
    populateHelper
);

// Route with document ID: /api/populate/:action/:model/:id
router.all(
    "/:action/:model/:id",
    authMiddleware,
    upload.fields([
        { name: "file", maxCount: 1 },
        { name: "profileImage", maxCount: 1 },
        { name: "logo", maxCount: 1 },
        { name: "attachments", maxCount: 10 },
        { name: "product-image", maxCount: 10 }
    ]),
    populateHelper
);

export default router;
