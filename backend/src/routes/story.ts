// backend/src/routes/story.ts

import { Router } from "express";
import { StoryController } from "../controllers/StoryController";
import { authMiddleware } from "../middlewares/auth";

const router = Router({ mergeParams: true });

// Add a story to a session
// POST /api/v1/sessions/:sessionId/stories
router.post("/", authMiddleware, StoryController.add);

// List all stories for a session
// GET /api/v1/sessions/:sessionId/stories
router.get("/", authMiddleware, StoryController.list);

// Update a single story by ID
// PUT /api/v1/stories/:storyId
router.put("/:storyId", authMiddleware, StoryController.update);

// Delete a story by ID
// DELETE /api/v1/stories/:storyId
router.delete("/:storyId", authMiddleware, StoryController.delete);

// Reorder stories for a session
// PUT /api/v1/sessions/:sessionId/stories
router.put("/", authMiddleware, StoryController.reorder);

export default router;