// backend/src/routes/analytics.ts

import { Router } from "express";
import { SessionAnalyticsController } from "../controllers/SessionAnalyticsController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// All analytics routes require authentication
// GET /api/v1/sessions/:sessionId/analytics
router.get("/sessions/:sessionId/analytics", authMiddleware, SessionAnalyticsController.getSessionAnalytics);

// POST /api/v1/sessions/analytics/batch (for multiple sessions)
router.post("/sessions/analytics/batch", authMiddleware, SessionAnalyticsController.getBatchAnalytics);

// PUT /api/v1/stories/:storyId/finalize (for setting final scores)
router.put("/stories/:storyId/finalize", authMiddleware, SessionAnalyticsController.finalizeStoryScore);

export default router;