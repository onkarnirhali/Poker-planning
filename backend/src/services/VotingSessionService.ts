// STEP 7: Create backend/src/services/VotingSessionService.ts

import { Repository, DataSource } from "typeorm";
import { VotingSession, VotingEndReason } from "../entities/VotingSession";
import { SessionParticipant, ParticipantStatus, ParticipantRole } from "../entities/SessionParticipant";
import { Session } from "../entities/Session";

export class VotingSessionService {
  private votingSessionRepo: Repository<VotingSession>;
  private participantRepo: Repository<SessionParticipant>;
  private sessionRepo: Repository<Session>;

  constructor(dataSource: DataSource) {
    this.votingSessionRepo = dataSource.getRepository(VotingSession);
    this.participantRepo = dataSource.getRepository(SessionParticipant);
    this.sessionRepo = dataSource.getRepository(Session);
  }

  /**
   * Check if user is facilitator for a session
   */
  async isUserFacilitator(sessionId: string, userId: string): Promise<boolean> {
    try {
      const session = await this.sessionRepo.findOne({
        where: { id: sessionId },
        select: ["facilitator_id"]
      });
      
      return session?.facilitator_id === userId;
    } catch (error) {
      console.error("Error checking facilitator status:", error);
      return false;
    }
  }

  /**
   * Add or update participant in session
   */
  async addParticipant(
    sessionId: string, 
    userId: string, 
    role: ParticipantRole = "participant"
  ): Promise<SessionParticipant> {
    try {
      // Check if participant already exists
      let participant = await this.participantRepo.findOne({
        where: { session_id: sessionId, user_id: userId }
      });

      if (participant) {
        // Update existing participant
        participant.isOnline = true;
        participant.lastActiveAt = new Date();
        participant.role = role;
      } else {
        // Create new participant
        participant = this.participantRepo.create({
          session_id: sessionId,
          user_id: userId,
          role,
          status: "idle",
          isOnline: true
        });
      }

      return await this.participantRepo.save(participant);
    } catch (error) {
      console.error("Error adding participant:", error);
      throw new Error("Failed to add participant to session");
    }
  }

  /**
   * Get all participants for a session
   */
  async getSessionParticipants(sessionId: string): Promise<SessionParticipant[]> {
    try {
      return await this.participantRepo.find({
        where: { session_id: sessionId, isOnline: true },
        relations: ["user"],
        order: { joinedAt: "ASC" }
      });
    } catch (error) {
      console.error("Error getting session participants:", error);
      throw new Error("Failed to get session participants");
    }
  }

  /**
   * Update participant status (voting/voted/idle)
   */
  async updateParticipantStatus(
    sessionId: string, 
    userId: string, 
    status: ParticipantStatus
  ): Promise<void> {
    try {
      await this.participantRepo.update(
        { session_id: sessionId, user_id: userId },
        { status, lastActiveAt: new Date() }
      );
    } catch (error) {
      console.error("Error updating participant status:", error);
      throw new Error("Failed to update participant status");
    }
  }

  /**
   * Start a new voting session for a story
   */
  async startVotingSession(
    sessionId: string,
    storyId: string,
    timerDuration: number
  ): Promise<VotingSession> {
    try {
      // End any existing active voting session for this session
      await this.votingSessionRepo.update(
        { session_id: sessionId, endedAt: null },
        { 
          endedAt: new Date(),
          endReason: "new_voting_started"
        }
      );

      // Create new voting session
      const votingSession = this.votingSessionRepo.create({
        session_id: sessionId,
        story_id: storyId,
        timerDuration,
        startedAt: new Date()
      });

      const savedVotingSession = await this.votingSessionRepo.save(votingSession);

      // Reset all participants to "voting" status
      await this.participantRepo.update(
        { session_id: sessionId },
        { status: "voting", lastActiveAt: new Date() }
      );

      return savedVotingSession;
    } catch (error) {
      console.error("Error starting voting session:", error);
      throw new Error("Failed to start voting session");
    }
  }

  /**
   * End voting session early
   */
  async endVotingSession(
    sessionId: string,
    storyId: string,
    endedBy: string,
    endReason: VotingEndReason = "ended_early"
  ): Promise<VotingSession | null> {
    try {
      // Find active voting session
      const votingSession = await this.votingSessionRepo.findOne({
        where: { 
          session_id: sessionId, 
          story_id: storyId,
          endedAt: null // Still active
        }
      });

      if (!votingSession) {
        return null;
      }

      // End the voting session
      votingSession.endedAt = new Date();
      votingSession.endedBy = endedBy;
      votingSession.endReason = endReason;

      return await this.votingSessionRepo.save(votingSession);
    } catch (error) {
      console.error("Error ending voting session:", error);
      throw new Error("Failed to end voting session");
    }
  }

  /**
   * Get active voting session for a session
   */
  async getActiveVotingSession(sessionId: string): Promise<VotingSession | null> {
    try {
      return await this.votingSessionRepo.findOne({
        where: { 
          session_id: sessionId,
          endedAt: null
        },
        relations: ["story"]
      });
    } catch (error) {
      console.error("Error getting active voting session:", error);
      return null;
    }
  }

  /**
   * Get voting statistics for a session
   */
  async getVotingStats(sessionId: string) {
    try {
      const participants = await this.getSessionParticipants(sessionId);
      
      let votedCount = 0;
      let votingCount = 0;
      let idleCount = 0;

      participants.forEach(participant => {
        switch (participant.status) {
          case "voted":
            votedCount++;
            break;
          case "voting":
            votingCount++;
            break;
          case "idle":
            idleCount++;
            break;
        }
      });

      return {
        totalParticipants: participants.length,
        voted: votedCount,
        stillVoting: votingCount,
        idle: idleCount,
        percentage: participants.length > 0 ? Math.round((votedCount / participants.length) * 100) : 0,
        participants: participants.map(p => ({
          userId: p.user_id,
          name: p.user?.name,
          role: p.role,
          status: p.status,
          isOnline: p.isOnline,
          lastActiveAt: p.lastActiveAt
        }))
      };
    } catch (error) {
      console.error("Error getting voting stats:", error);
      throw new Error("Failed to get voting statistics");
    }
  }
}