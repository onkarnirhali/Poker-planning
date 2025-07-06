// backend/src/entities/Story.ts - UPDATED VERSION
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Session } from "./Session";

@Entity({ name: "stories" })
export class Story {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ default: "feature" })
  storyType!: string;

  @Column({ nullable: true })
  priority?: string;

  @Column({ nullable: true })
  externalId?: string;

  @Column({ type: "int" })
  orderIndex!: number;

  @Column({ default: false })
  isClosed!: boolean;

  // NEW: Final score set by facilitator after voting
  @Column({ nullable: true })
  finalScore?: string;

  // NEW: Average of all votes for this story
  @Column({ type: "decimal", precision: 3, scale: 1, nullable: true })
  averageVote?: number;

  @ManyToOne(() => Session)
  @JoinColumn({ name: "session_id" })
  session!: Session;

  @Column("uuid")
  session_id!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}