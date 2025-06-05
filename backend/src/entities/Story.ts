
// src/entities/Story.ts
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