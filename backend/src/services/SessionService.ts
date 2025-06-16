// backend/src/services/SessionService.ts

import { Repository, DataSource } from "typeorm";
import bcrypt from "bcryptjs";
import { Session } from "../entities/Session";

export class SessionService {
  private sessionRepository: Repository<Session>;

  constructor(dataSource: DataSource) {
    // Initialize the repository for the Session entity
    this.sessionRepository = dataSource.getRepository(Session);
  }

  async createSession(
    facilitatorId: string,
    name: string,
    password?: string,
    timerDuration = 60,
    maxParticipants = 10
  ) {
    // 1) If a password is provided, hash it. Otherwise, leave passwordHash null.
    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
    }

    // 2) Create a new Session entity in memory
    const session = this.sessionRepository.create({
      name,
      facilitator_id: facilitatorId,
      passwordHash,
      timerDuration,
      maxParticipants,
      deckType: "fibonacci", // MVP default
      isLocked: false       // default to unlocked
    });

    // 3) Save the session to the database
    await this.sessionRepository.save(session);

    // 4) Generate a 6‐character join code from the UUID (first 6 chars of the hyphenated ID)
    const joinCode = session.id.split("-")[0].toUpperCase().slice(0, 6);

    return { session, joinCode };
  }

  async getAllSessions() {
    // Fetch all sessions, ordered by creation date
    let data = await this.sessionRepository.find({
    order: { createdAt: "DESC" },
    });
    console.log("Fetched all sessions:", data);
    return data;
 }
  async getSession(sessionId: string) {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new Error("Session not found");
    }
    return session;
  }


  async updateSession(
    sessionId: string,
    updates: Partial<Session>,
    facilitatorId: string
  ) {
    // 1) Load the session
    const session = await this.getSession(sessionId);

    // 2) Ensure the caller is indeed the facilitator
    if (session.facilitator_id !== facilitatorId) {
      throw new Error("Forbidden: Only facilitator can update session");
    }

    // 3) If password is being updated, re‐hash it
    if ((updates as any).password) {
      // If they pass a new `password` field in updates, hash it to passwordHash
      const newPassword = (updates as any).password as string;
      const newHash = await bcrypt.hash(newPassword, 12);
      updates = { 
        ...updates, 
        passwordHash: newHash 
      };
      // Remove the plain‐text password field so TypeORM does not try to write it
      delete (updates as any).password;
    }

    // 4) Copy over fields from `updates` to the session object
    Object.assign(session, updates);

    // 5) Save the updated session back to the database
    return await this.sessionRepository.save(session);
  }


  async deleteSession(sessionId: string, facilitatorId: string) {
    // 1) Load the session
    const session = await this.getSession(sessionId);

    // 2) Ensure the caller is the facilitator
    if (session.facilitator_id !== facilitatorId) {
      throw new Error("Forbidden: Only facilitator can delete session");
    }

    // 3) Delete the session record
    await this.sessionRepository.delete(sessionId);
  }
}