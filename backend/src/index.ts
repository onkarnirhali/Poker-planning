// src/index.ts
import "reflect-metadata";
import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import { AppDataSource } from "./AppDataSource";

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

  io.on("connection", (socket) => {
    console.log("🔌 WebSocket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected:", socket.id);
    });
  });

  server.listen(port, () => {
    console.log(`🚀 Backend listening at http://localhost:${port}`);
  });
}

main().catch((err) => console.error(err));