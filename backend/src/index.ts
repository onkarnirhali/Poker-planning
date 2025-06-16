// src/index.ts
import "reflect-metadata";
import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import { AppDataSource } from "./AppDataSource";
import { registerVotingHandlers } from "./sockets/voting";
//Routers Impports
import authRoutes from "./routes/auth";
import sessionRoutes from "./routes/session";
import storyRoutes from "./routes/story";


dotenv.config();

async function main() {
  // 1. Initialize TypeORM
  try {
    await AppDataSource.initialize();
    console.log("✅ Postgres connected via TypeORM");
  } catch (err) {
    console.error("❌ Could not initialize DataSource:", err);
    process.exit(1);
  }

  // 2. Create Express app
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/", sessionRoutes);
  app.use("/api/v1/sessions", sessionRoutes);
  app.use("/api/v1/sessions/:sessionId/stories", storyRoutes);

  // 3. Health-check endpoint
  app.get("/api/v1/health", (_req, res) =>
    res.json({ status: "OK", timestamp: new Date().toISOString() })
  );

  // 4. HTTP server + Socket.io
  const port = process.env.PORT || 4000;
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // lock down in production to your frontend’s URL
      methods: ["GET", "POST"],
    },
  });
  registerVotingHandlers(io);

  // Global error‐handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(400).json({ message: err.message });
  });

  server.listen(port, () => {
    console.log(`🚀 Backend listening at http://localhost:${port}`);
  });
}

main().catch((err) => console.error(err));