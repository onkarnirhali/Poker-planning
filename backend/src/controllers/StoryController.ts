// backend/src/controllers/StoryController.ts

import { Request, Response, NextFunction } from "express";
import { StoryService } from "../services/StoryService";
import { AppDataSource } from "../AppDataSource";

const storyService = new StoryService(AppDataSource);

export class StoryController {
  /**
   * POST /api/v1/sessions/:sessionId/stories
   * Add a story to a given session.
   */
  static async add(req: Request, res: Response, next: NextFunction) {
    try {
      const facilitatorId = (req as any).userId as string;
      const sessionId = req.params.sessionId;
      const { title, description, storyType, priority } = req.body;

      const story = await storyService.addStory(
        sessionId,
        title,
        description,
        storyType,
        priority
      );
      return res.status(201).json(story);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/sessions/:sessionId/stories
   * List all stories for the session.
   */
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = req.params.sessionId;
      const stories = await storyService.getStories(sessionId);
      return res.status(200).json(stories);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/stories/:storyId
   * Update a single story (title, description, type, priority).
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const facilitatorId = (req as any).userId as string;
      const storyId = req.params.storyId;
      const updates: Partial<Record<string, any>> = req.body;

      const updatedStory = await storyService.updateStory(storyId, updates, facilitatorId);
      return res.status(200).json(updatedStory);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/stories/:storyId
   * Delete a story if not closed.
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const facilitatorId = (req as any).userId as string;
      const storyId = req.params.storyId;
      // We assume service checks if story is closed or not; 
      // you could also verify facilitator ownership if you store session_id elsewhere
      await storyService.deleteStory(storyId);
      return res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/sessions/:sessionId/stories
   * Reorder stories by sending an array of IDs in the desired order.
   * Body: { "newOrder": ["storyId1", "storyId3", "storyId2", ...] }
   */
  static async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const facilitatorId = (req as any).userId as string;
      const sessionId = req.params.sessionId;
      const { newOrder } = req.body as { newOrder: string[] };

      await storyService.reorderStories(sessionId, newOrder);
      return res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
}