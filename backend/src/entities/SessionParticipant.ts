import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Session } from "./Session";
import { User } from "./User";

export type ParticipantRole = "facilitator" | "participant";
export type ParticipantStatus = "voting" | "voted" | "idle";

@Entity({ name: "session_participants" })
@Unique(["session_id", "user_id"]) // Ensure one record per user per session
export class SessionParticipant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  session_id!: string;

  @Column("uuid")
  user_id!: string;

  @Column({ default: "participant" })
  role!: ParticipantRole;

  @Column({ default: "voting" })
  status!: ParticipantStatus;

  @CreateDateColumn({ type: "timestamptz" })
  joinedAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  lastActiveAt!: Date;

  @Column({ default: true })
  isOnline!: boolean;

  // Relations
  @ManyToOne(() => Session)
  @JoinColumn({ name: "session_id" })
  session!: Session;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;
}