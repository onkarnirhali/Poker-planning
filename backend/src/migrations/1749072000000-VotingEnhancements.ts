// backend/src/migrations/1749072000000-VotingEnhancements.ts

import { MigrationInterface, QueryRunner } from "typeorm";

export class VotingEnhancements1749072000000 implements MigrationInterface {
    name = 'VotingEnhancements1749072000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add timer-related columns to sessions table
        await queryRunner.query(`
            ALTER TABLE "sessions" 
            ADD COLUMN "currentStoryId" uuid NULL,
            ADD COLUMN "votingTimerDuration" integer NOT NULL DEFAULT 300,
            ADD COLUMN "isVotingActive" boolean NOT NULL DEFAULT false,
            ADD COLUMN "votingStartedAt" TIMESTAMP WITH TIME ZONE NULL,
            ADD COLUMN "votingEndsAt" TIMESTAMP WITH TIME ZONE NULL
        `);

        // 2. Create session_participants table for real-time tracking
        await queryRunner.query(`
            CREATE TABLE "session_participants" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "sessionId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "role" character varying NOT NULL DEFAULT 'participant',
                "status" character varying NOT NULL DEFAULT 'voting',
                "joinedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "lastActiveAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "isOnline" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_session_participants" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_session_participants_session_user" UNIQUE ("sessionId", "userId")
            )
        `);

        // 3. Create voting_sessions table for tracking individual voting rounds
        await queryRunner.query(`
            CREATE TABLE "voting_sessions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "sessionId" uuid NOT NULL,
                "storyId" uuid NOT NULL,
                "timerDuration" integer NOT NULL DEFAULT 300,
                "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "endedAt" TIMESTAMP WITH TIME ZONE NULL,
                "endedBy" uuid NULL,
                "endReason" character varying NULL,
                "isRevealed" boolean NOT NULL DEFAULT false,
                "revealedAt" TIMESTAMP WITH TIME ZONE NULL,
                "revealedBy" uuid NULL,
                "consensusPercentage" integer NULL,
                "averageVote" decimal(5,2) NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_voting_sessions" PRIMARY KEY ("id")
            )
        `);

        // 4. Enhance votes table with voting session reference
        await queryRunner.query(`
            ALTER TABLE "votes" 
            ADD COLUMN "votingSessionId" uuid NULL,
            ADD COLUMN "submittedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);

        // 5. Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "sessions" 
            ADD CONSTRAINT "FK_sessions_currentStory" 
            FOREIGN KEY ("currentStoryId") REFERENCES "stories"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "session_participants" 
            ADD CONSTRAINT "FK_session_participants_session" 
            FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE,
            ADD CONSTRAINT "FK_session_participants_user" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "voting_sessions" 
            ADD CONSTRAINT "FK_voting_sessions_session" 
            FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE,
            ADD CONSTRAINT "FK_voting_sessions_story" 
            FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE,
            ADD CONSTRAINT "FK_voting_sessions_endedBy" 
            FOREIGN KEY ("endedBy") REFERENCES "users"("id") ON DELETE SET NULL,
            ADD CONSTRAINT "FK_voting_sessions_revealedBy" 
            FOREIGN KEY ("revealedBy") REFERENCES "users"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "votes" 
            ADD CONSTRAINT "FK_votes_votingSession" 
            FOREIGN KEY ("votingSessionId") REFERENCES "voting_sessions"("id") ON DELETE SET NULL
        `);

        // 6. Create indexes for performance
        await queryRunner.query(`
            CREATE INDEX "IDX_session_participants_session" ON "session_participants" ("sessionId");
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_session_participants_user" ON "session_participants" ("userId");
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_session_participants_online" ON "session_participants" ("isOnline");
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_voting_sessions_session" ON "voting_sessions" ("sessionId");
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_voting_sessions_story" ON "voting_sessions" ("storyId");
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_voting_sessions_active" ON "voting_sessions" ("endedAt") WHERE "endedAt" IS NULL;
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_votes_voting_session" ON "votes" ("votingSessionId");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_votes_votingSession"`);
        await queryRunner.query(`ALTER TABLE "voting_sessions" DROP CONSTRAINT "FK_voting_sessions_revealedBy"`);
        await queryRunner.query(`ALTER TABLE "voting_sessions" DROP CONSTRAINT "FK_voting_sessions_endedBy"`);
        await queryRunner.query(`ALTER TABLE "voting_sessions" DROP CONSTRAINT "FK_voting_sessions_story"`);
        await queryRunner.query(`ALTER TABLE "voting_sessions" DROP CONSTRAINT "FK_voting_sessions_session"`);
        await queryRunner.query(`ALTER TABLE "session_participants" DROP CONSTRAINT "FK_session_participants_user"`);
        await queryRunner.query(`ALTER TABLE "session_participants" DROP CONSTRAINT "FK_session_participants_session"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_sessions_currentStory"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_votes_voting_session"`);
        await queryRunner.query(`DROP INDEX "IDX_voting_sessions_active"`);
        await queryRunner.query(`DROP INDEX "IDX_voting_sessions_story"`);
        await queryRunner.query(`DROP INDEX "IDX_voting_sessions_session"`);
        await queryRunner.query(`DROP INDEX "IDX_session_participants_online"`);
        await queryRunner.query(`DROP INDEX "IDX_session_participants_user"`);
        await queryRunner.query(`DROP INDEX "IDX_session_participants_session"`);

        // Drop new columns
        await queryRunner.query(`ALTER TABLE "votes" DROP COLUMN "submittedAt", DROP COLUMN "votingSessionId"`);
        
        // Drop new tables
        await queryRunner.query(`DROP TABLE "voting_sessions"`);
        await queryRunner.query(`DROP TABLE "session_participants"`);
        
        // Drop new session columns
        await queryRunner.query(`
            ALTER TABLE "sessions" 
            DROP COLUMN "votingEndsAt",
            DROP COLUMN "votingStartedAt",
            DROP COLUMN "isVotingActive", 
            DROP COLUMN "votingTimerDuration",
            DROP COLUMN "currentStoryId"
        `);
    }
}