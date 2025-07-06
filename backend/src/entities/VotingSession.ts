// backend/src/entities/VotingSession.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Session } from "./Session";
import { Story } from "./Story";
import { User } from "./User";
import { Vote } from "./Vote";

export type VotingEndReason = "timer_expired" | "ended_early" | "force_reveal" | "all_voted";

@Entity({ name: "voting_sessions" })
export class VotingSession {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  session_id!: string;

  @Column("uuid")
  story_id!: string;

  @Column({ type: "int", default: 300 })
  timerDuration!: number;

  @CreateDateColumn({ type: "timestamptz" })
  startedAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  endedAt?: Date;

  @Column("uuid", { nullable: true })
  endedBy?: string;

  @Column({ nullable: true })
  endReason?: VotingEndReason;

  @Column({ default: false })
  isRevealed!: boolean;

  @Column({ type: "timestamptz", nullable: true })
  revealedAt?: Date;

  @Column("uuid", { nullable: true })
  revealedBy?: string;

  @Column({ type: "int", nullable: true })
  consensusPercentage?: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  averageVote?: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Session)
  @JoinColumn({ name: "session_id" })
  session!: Session;

  @ManyToOne(() => Story)
  @JoinColumn({ name: "story_id" })
  story!: Story;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "endedBy" })
  endedByUser?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "revealedBy" })
  revealedByUser?: User;

  @OneToMany(() => Vote, vote => vote.votingSession)
  votes!: Vote[];
}