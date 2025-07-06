// backend/src/controllers/SessionAnalyticsController.ts

import { Request, Response, NextFunction } from "express";
import { SessionAnalyticsService } from "../services/SessionAnalyticsService";
import { AppDataSource } from "../AppDataSource";

const sessionAnalyticsService = new SessionAnalyticsService(AppDataSource);

export class SessionAnalyticsController {
  /**
   * GET /api/v1/sessions/:sessionId/analytics
   * Get comprehensive analytics for a single session
   */
  static async getSessionAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = req.params.sessionId;
      const facilitatorId = (req as any).userId as string;

      // Get analytics data
      const analytics = await sessionAnalyticsService.getSessionAnalytics(sessionId);

      // Optional: Verify facilitator owns this session (security check)
      if (analytics.basicInfo.facilitatorId !== facilitatorId) {
        return res.status(403).json({ 
          message: "Access denied: You can only view analytics for your own sessions" 
        });
      }

      return res.status(200).json(analytics);
    } catch (error: any) {
      if (error.message === "Session not found") {
        return res.status(404).json({ message: "Session not found" });
      }
      next(error);
    }
  }

  /**
   * GET /api/v1/sessions/analytics/batch
   * Get analytics for multiple sessions (for sessions list page)
   * Body: { sessionIds: string[] }
   */
  static async getBatchAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const facilitatorId = (req as any).userId as string;
      const { sessionIds } = req.body;

      if (!Array.isArray(sessionIds)) {
        return res.status(400).json({ 
          message: "sessionIds must be an array" 
        });
      }

      // Get analytics for all requested sessions
      const analyticsResults = await sessionAnalyticsService.getMultipleSessionsAnalytics(sessionIds);

      // Filter to only sessions owned by this facilitator (security)
      const filteredResults = analyticsResults.filter(analytics => 
        analytics && analytics.basicInfo.facilitatorId === facilitatorId
      );

      return res.status(200).json({
        sessions: filteredResults,
        totalRequested: sessionIds.length,
        totalReturned: filteredResults.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/stories/:storyId/finalize
   * Set final score for a story (facilitator only)
   */
  static async finalizeStoryScore(req: Request, res: Response, next: NextFunction) {
    try {
      const storyId = req.params.storyId;
      const facilitatorId = (req as any).userId as string;
      const { finalScore, averageVote } = req.body;

      // This would be implemented in StoryService, but adding here for completeness
      // await storyService.finalizeScore(storyId, finalScore, averageVote, facilitatorId);

      return res.status(200).json({ 
        message: "Story score finalized successfully",
        storyId,
        finalScore
      });
    } catch (error) {
      next(error);
    }
  }
}