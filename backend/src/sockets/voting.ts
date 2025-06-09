// backend/src/sockets/voting.ts

import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import redisClient from "../utils/redisClient";
import { VoteService } from "../services/VoteService";
import { AppDataSource } from "../AppDataSource";

// Instantiate the VoteService
const voteService = new VoteService(AppDataSource);

// This function will be called from index.ts after creating the io server
export function registerVotingHandlers(io: Server) {
  io.on("connection", async (socket: Socket) => {
    // 1) Authenticate the socket via JWT passed in `socket.handshake.auth`
    const token = socket.handshake.auth.token as string;
    let userId: string;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret") as {
        userId: string;
      };
      userId = payload.userId;
    } catch {
      socket.disconnect(true);
      return;
    }

    // 2) Handle "join_session"
    socket.on("join_session", async ({ sessionId }: { sessionId: string }) => {
      // Put this socket into the room named after the session
      socket.join(sessionId);

      // Add user to Redis presence set (score = current timestamp)
      await redisClient.zAdd(`session:${sessionId}:participants`, {
        score: Date.now(),
        value: userId,
      });

      // Broadcast to everyone in the room that a new participant joined
      io.to(sessionId).emit("participant_joined", { userId });
    });

    // 3) Handle "vote_submit"
    socket.on(
      "vote_submit",
      async (payload: { sessionId: string; storyId: string; value: string }) => {
        const { sessionId, storyId, value } = payload;

        // Store vote in Redis hash
        await redisClient.hSet(`votes:${sessionId}:${storyId}`, userId, value);

        // Notify others that this user has voted
        io.to(sessionId).emit("participant_voted", { userId, storyId });
      }
    );

    // 4) Handle "reveal_votes"
    socket.on("reveal_votes", async ({ sessionId, storyId }: { sessionId: string; storyId: string }) => {
      // 1. Read all votes from Redis hash
      const votesMap = await redisClient.hGetAll(`votes:${sessionId}:${storyId}`);

      // 2. Get current participants to fill in missing votes
      const participants = await redisClient.zRange(`session:${sessionId}:participants`, 0, -1);
      const allVotes = participants.map((pid) => ({
        userId: pid,
        value: votesMap[pid] || "No Vote",
      }));

      // 3. Persist to Postgres
      await voteService.saveVotes(allVotes);

      // 4. Compute distribution
      const distribution: Record<string, number> = {};
      allVotes.forEach((v) => {
        distribution[v.value] = (distribution[v.value] || 0) + 1;
      });

      // 5. Broadcast revealed votes and distribution
      io.to(sessionId).emit("votes_revealed", {
        storyId,
        votes: allVotes,
        distribution,
      });
    });

    // 5) Handle "revote"
    socket.on("revote", async ({ sessionId, storyId }: { sessionId: string; storyId: string }) => {
      // Clear votes in Redis
      await redisClient.del(`votes:${sessionId}:${storyId}`);

      // Broadcast to reset UI
      io.to(sessionId).emit("votes_cleared", { storyId });
    });

    // 6) Handle "finalize_story"
    socket.on(
      "finalize_story",
      async ({ sessionId, storyId, finalValue }: { sessionId: string; storyId: string; finalValue: string }) => {
        // Broadcast finalization
        io.to(sessionId).emit("story_finalized", { storyId, finalValue });
      }
    );
  });
}