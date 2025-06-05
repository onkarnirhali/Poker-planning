// backend/src/controllers/AuthController.ts

import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { AppDataSource } from "../AppDataSource";

const authService = new AuthService(AppDataSource);

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const { user, accessToken } = await authService.signup(email, password, name);

      // Strip out the password hash before sending
      const safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        timezone: user.timezone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return res.status(201).json({ user: safeUser, accessToken });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, accessToken } = await authService.login(email, password);

      // Strip out the password hash before sending
      const safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        timezone: user.timezone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return res.status(200).json({ user: safeUser, accessToken });
    } catch (err) {
      next(err);
    }
  }
}