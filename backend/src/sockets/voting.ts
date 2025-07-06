// backend/src/sockets/voting.ts - ENHANCED VERSION

import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import redisClient from "../utils/redisClient";
import { VoteService } from "../services/VoteService";
import { AppDataSource } from "../AppDataSource";

// Instantiate the VoteService
const voteService = new VoteService(AppDataSource);

// Timer storage - In production, this should be in Redis
const sessionTimers = new Map<string, {
  timeLeft: number;
  duration: number;
  interval: NodeJS.Timeout | null;
  storyId: string;
  isActive: boolean;
}>();

export function registerVotingHandlers(io: Server) {
  io.on("connection", async (socket: Socket) => {
    
    // 1) Authenticate the socket via JWT
    const token = socket.handshake.auth.token as string;
    let userId: string;
    let userRole: string = "participant"; // Default role

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret") as {
        userId: string;
      };
      userId = payload.userId;
      
      // TODO: Get user role from database (facilitator vs participant)
      // For now, we'll determine this when joining session
    } catch {
      socket.disconnect(true);
      return;
    }

    // 2) Handle "join_session" - Enhanced with role detection
    socket.on("join_session", async ({ sessionId }: { sessionId: string }) => {
      try {
        // Join the room
        socket.join(sessionId);

        // Add user to Redis presence set
        await redisClient.zAdd(`session:${sessionId}:participants`, {
          score: Date.now(),
          value: userId,
        });

        // Check if user is facilitator (check session.facilitator_id)
        // TODO: Add database query to check facilitator role
        const isSessionFacilitator = true; // Placeholder for demo
        if (isSessionFacilitator) {
          userRole = "facilitator";
          socket.join(`${sessionId}:facilitators`); // Special room for facilitator events
        }

        // Get current session state
        const sessionState = await getSessionState(sessionId);
        
        // Send current state to joining user
        socket.emit("session_state", {
          ...sessionState,
          userRole,
          userId
        });

        // Broadcast to everyone that a new participant joined
        io.to(sessionId).emit("participant_joined", { 
          userId, 
          userRole: userRole === "facilitator" ? "facilitator" : "participant",
          timestamp: Date.now()
        });

        // Send updated participant list and stats
        await broadcastParticipantStats(sessionId, io);

      } catch (error) {
        console.error("Error in join_session:", error);
        socket.emit("error", { message: "Failed to join session" });
      }
    });

    // 3) Handle "start_voting_timer" - NEW: Timer management
    socket.on("start_voting_timer", async ({ 
      sessionId, 
      storyId, 
      duration = 300 // 5 minutes default
    }: { 
      sessionId: string; 
      storyId: string; 
      duration?: number;
    }) => {
      try {
        // Only facilitators can start timer
        if (userRole !== "facilitator") {
          socket.emit("error", { message: "Only facilitators can start voting timer" });
          return;
        }

        // Clear any existing timer for this session
        const existingTimer = sessionTimers.get(sessionId);
        if (existingTimer?.interval) {
          clearInterval(existingTimer.interval);
        }

        // Create new timer
        const timerData = {
          timeLeft: duration,
          duration,
          interval: null as NodeJS.Timeout | null,
          storyId,
          isActive: true
        };

        // Start countdown
        timerData.interval = setInterval(async () => {
          timerData.timeLeft--;

          // Broadcast timer update to all participants
          io.to(sessionId).emit("timer_update", {
            timeLeft: timerData.timeLeft,
            duration: timerData.duration,
            storyId: timerData.storyId,
            status: timerData.timeLeft <= 0 ? "expired" : 
                   timerData.timeLeft <= 30 ? "critical" :
                   timerData.timeLeft <= 60 ? "warning" : "normal"
          });

          // Timer expired
          if (timerData.timeLeft <= 0) {
            clearInterval(timerData.interval!);
            timerData.isActive = false;
            
            // Enable reveal for facilitators
            io.to(`${sessionId}:facilitators`).emit("timer_expired", {
              sessionId,
              storyId: timerData.storyId,
              canReveal: true
            });
          }
        }, 1000);

        sessionTimers.set(sessionId, timerData);

        // Store timer info in Redis for persistence
        await redisClient.hSet(`session:${sessionId}:timer`, {
          storyId,
          duration: duration.toString(),
          startTime: Date.now().toString(),
          isActive: "true"
        });

        // Broadcast timer started
        io.to(sessionId).emit("voting_timer_started", {
          storyId,
          duration,
          timeLeft: duration
        });

      } catch (error) {
        console.error("Error starting timer:", error);
        socket.emit("error", { message: "Failed to start voting timer" });
      }
    });

    // 4) Handle "end_voting_early" - NEW: Facilitator control
    socket.on("end_voting_early", async ({ 
      sessionId, 
      storyId 
    }: { 
      sessionId: string; 
      storyId: string;
    }) => {
      try {
        // Only facilitators can end voting early
        if (userRole !== "facilitator") {
          socket.emit("error", { message: "Only facilitators can end voting early" });
          return;
        }

        // Stop timer
        const timerData = sessionTimers.get(sessionId);
        if (timerData?.interval) {
          clearInterval(timerData.interval);
          timerData.timeLeft = 0;
          timerData.isActive = false;
        }

        // Update Redis
        await redisClient.hSet(`session:${sessionId}:timer`, {
          isActive: "false",
          endedEarly: "true",
          endTime: Date.now().toString()
        });

        // Broadcast voting ended early
        io.to(sessionId).emit("voting_ended_early", {
          storyId,
          endedBy: userId,
          timestamp: Date.now()
        });

        // Enable reveal for facilitator
        io.to(`${sessionId}:facilitators`).emit("can_reveal_votes", {
          sessionId,
          storyId,
          reason: "ended_early"
        });

      } catch (error) {
        console.error("Error ending voting early:", error);
        socket.emit("error", { message: "Failed to end voting early" });
      }
    });

    // 5) Enhanced "vote_submit" with status tracking
    socket.on("vote_submit", async (payload: { 
      sessionId: string; 
      storyId: string; 
      value: string;
    }) => {
      try {
        const { sessionId, storyId, value } = payload;

        // Store vote in Redis hash
        await redisClient.hSet(`votes:${sessionId}:${storyId}`, userId, value);

        // Update participant status to "voted"
        await redisClient.hSet(`session:${sessionId}:participant_status`, userId, "voted");

        // Notify others that this user has voted (without revealing the vote)
        io.to(sessionId).emit("participant_voted", { 
          userId, 
          storyId,
          timestamp: Date.now()
        });

        // Send updated voting statistics
        await broadcastVotingStats(sessionId, storyId, io);

      } catch (error) {
        console.error("Error submitting vote:", error);
        socket.emit("error", { message: "Failed to submit vote" });
      }
    });

    // 6) Enhanced "reveal_votes" with timer check
    socket.on("reveal_votes", async ({ 
      sessionId, 
      storyId 
    }: { 
      sessionId: string; 
      storyId: string;
    }) => {
      try {
        // Only facilitators can reveal votes
        if (userRole !== "facilitator") {
          socket.emit("error", { message: "Only facilitators can reveal votes" });
          return;
        }

        // Check if timer has expired or was ended early
        const timerData = sessionTimers.get(sessionId);
        const timerInfo = await redisClient.hGetAll(`session:${sessionId}:timer`);
        
        if (timerData?.isActive && timerData.timeLeft > 0) {
          socket.emit("error", { message: "Cannot reveal votes while timer is active" });
          return;
        }

        // Get all votes and participants (existing logic)
        const votesMap = await redisClient.hGetAll(`votes:${sessionId}:${storyId}`);
        const participants = await redisClient.zRange(`session:${sessionId}:participants`, 0, -1);
        
        const allVotes = participants.map((pid) => ({
          userId: pid,
          value: votesMap[pid] || "No Vote",
          storyId
        }));

        // Save to PostgreSQL
        await voteService.saveVotes(allVotes.map(v => ({
          storyId: v.storyId,
          userId: v.userId,
          value: v.value
        })));

        // Calculate distribution and consensus
        const distribution: Record<string, number> = {};
        const validVotes = allVotes.filter(v => v.value !== "No Vote");
        
        validVotes.forEach((v) => {
          distribution[v.value] = (distribution[v.value] || 0) + 1;
        });

        // Calculate consensus percentage
        const totalValidVotes = validVotes.length;
        const maxVotes = Math.max(...Object.values(distribution));
        const consensusPercentage = totalValidVotes > 0 ? Math.round((maxVotes / totalValidVotes) * 100) : 0;

        // Broadcast revealed votes and results
        io.to(sessionId).emit("votes_revealed", {
          storyId,
          votes: allVotes,
          distribution,
          consensusPercentage,
          totalParticipants: participants.length,
          totalVotes: validVotes.length,
          timestamp: Date.now()
        });

        // Clear timer data
        sessionTimers.delete(sessionId);
        await redisClient.del(`session:${sessionId}:timer`);

      } catch (error) {
        console.error("Error revealing votes:", error);
        socket.emit("error", { message: "Failed to reveal votes" });
      }
    });

    // 7) Handle "revote" (existing logic, enhanced)
    socket.on("revote", async ({ 
      sessionId, 
      storyId 
    }: { 
      sessionId: string; 
      storyId: string;
    }) => {
      try {
        // Only facilitators can start revote
        if (userRole !== "facilitator") {
          socket.emit("error", { message: "Only facilitators can start revote" });
          return;
        }

        // Clear votes in Redis
        await redisClient.del(`votes:${sessionId}:${storyId}`);
        
        // Reset all participant statuses to "voting"
        const participants = await redisClient.zRange(`session:${sessionId}:participants`, 0, -1);
        for (const participant of participants) {
          await redisClient.hSet(`session:${sessionId}:participant_status`, participant, "voting");
        }

        // Clear any existing timer
        const timerData = sessionTimers.get(sessionId);
        if (timerData?.interval) {
          clearInterval(timerData.interval);
        }
        sessionTimers.delete(sessionId);
        await redisClient.del(`session:${sessionId}:timer`);

        // Broadcast revote started
        io.to(sessionId).emit("revote_started", { 
          storyId,
          timestamp: Date.now()
        });

        // Reset voting stats
        await broadcastVotingStats(sessionId, storyId, io);

      } catch (error) {
        console.error("Error starting revote:", error);
        socket.emit("error", { message: "Failed to start revote" });
      }
    });

    // 8) Handle disconnect
    socket.on("disconnect", async () => {
      try {
        // Remove from all session participant lists
        // Note: In production, you'd want to track which sessions this user was in
        console.log(`User ${userId} disconnected`);
        
        // Cleanup logic would go here
        // await redisClient.zRem(`session:${sessionId}:participants`, userId);
        
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });
}

// Helper function to get current session state
async function getSessionState(sessionId: string) {
  try {
    // Get timer info
    const timerInfo = await redisClient.hGetAll(`session:${sessionId}:timer`);
    
    // Get participants
    const participants = await redisClient.zRange(`session:${sessionId}:participants`, 0, -1);
    
    // Get current story (this would come from your session management)
    // For now, we'll mock it
    const currentStory = {
      id: "story-1",
      title: "User Authentication System",
      description: "As a user, I want to be able to log in securely..."
    };

    return {
      sessionId,
      currentStory,
      timer: timerInfo.isActive === "true" ? {
        isActive: true,
        storyId: timerInfo.storyId,
        duration: parseInt(timerInfo.duration || "300"),
        // Calculate timeLeft based on startTime
        timeLeft: calculateTimeLeft(timerInfo.startTime, timerInfo.duration)
      } : null,
      participants: participants.length,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Error getting session state:", error);
    return null;
  }
}

// Helper function to broadcast participant statistics
async function broadcastParticipantStats(sessionId: string, io: Server) {
  try {
    const participants = await redisClient.zRange(`session:${sessionId}:participants`, 0, -1);
    
    // Get participant statuses
    const statusMap = await redisClient.hGetAll(`session:${sessionId}:participant_status`);
    
    let votedCount = 0;
    let votingCount = 0;
    
    participants.forEach(userId => {
      const status = statusMap[userId] || "voting";
      if (status === "voted") votedCount++;
      else votingCount++;
    });

    io.to(sessionId).emit("participant_stats", {
      totalParticipants: participants.length,
      voted: votedCount,
      stillVoting: votingCount,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Error broadcasting participant stats:", error);
  }
}

// Helper function to broadcast voting statistics
async function broadcastVotingStats(sessionId: string, storyId: string, io: Server) {
  try {
    const participants = await redisClient.zRange(`session:${sessionId}:participants`, 0, -1);
    const votes = await redisClient.hGetAll(`votes:${sessionId}:${storyId}`);
    
    const votedCount = Object.keys(votes).length;
    const stillVotingCount = participants.length - votedCount;

    io.to(sessionId).emit("voting_stats", {
      storyId,
      totalParticipants: participants.length,
      voted: votedCount,
      stillVoting: stillVotingCount,
      percentage: participants.length > 0 ? Math.round((votedCount / participants.length) * 100) : 0,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Error broadcasting voting stats:", error);
  }
}

// Helper function to calculate time left
function calculateTimeLeft(startTime: string, duration: string): number {
  if (!startTime || !duration) return 0;
  
  const start = parseInt(startTime);
  const dur = parseInt(duration);
  const elapsed = Math.floor((Date.now() - start) / 1000);
  
  return Math.max(0, dur - elapsed);
}