// backend/src/controllers/SessionController.ts

import { Request, Response, NextFunction } from "express";
import { SessionService } from "../services/SessionService";
import { AppDataSource } from "../AppDataSource";

const sessionService = new SessionService(AppDataSource);

export class SessionController {
  // POST /api/v1/sessions
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // The authenticated user's ID should be set by authMiddleware on req.userId
      const facilitatorId = (req as any).userId as string;
      const { name, password, timerDuration, maxParticipants } = req.body;

      const { session, joinCode } = await sessionService.createSession(
        facilitatorId,
        name,
        password,
        timerDuration,
        maxParticipants
      );

      return res.status(201).json({ session, joinCode });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/sessions/:sessionId
  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = req.params.sessionId;
      const session = await sessionService.getSession(sessionId);
      return res.status(200).json(session);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/v1/sessions/:sessionId
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const facilitatorId = (req as any).userId as string;
      const sessionId = req.params.sessionId;
      const updates: Partial<Record<string, any>> = req.body;

      const updated = await sessionService.updateSession(
        sessionId,
        updates,
        facilitatorId
      );
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/v1/sessions/:sessionId
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const facilitatorId = (req as any).userId as string;
      const sessionId = req.params.sessionId;
      await sessionService.deleteSession(sessionId, facilitatorId);
      return res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
}