// backend/src/routes/auth.ts

import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();

// POST /api/v1/auth/signup
router.post("/signup", AuthController.signup);

// POST /api/v1/auth/login
router.post("/login", AuthController.login);

export default router;