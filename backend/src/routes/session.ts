// backend/src/routes/session.ts

import { Router } from "express";
import { SessionController } from "../controllers/SessionController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// All session routes require authentication
router.post("/", authMiddleware, SessionController.create);
router.get("/:sessionId", authMiddleware, SessionController.getOne);
router.put("/:sessionId", authMiddleware, SessionController.update);
router.delete("/:sessionId", authMiddleware, SessionController.delete);

export default router;