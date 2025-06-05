// src/entities/Session.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { User } from "./User";

@Entity({ name: "sessions" })
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ default: "fibonacci" })
  deckType!: string;

  @Column({ type: "int", default: 60 })
  timerDuration!: number;

  @Column({ default: false })
  isLocked!: boolean;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ type: "int", default: 10 })
  maxParticipants!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "facilitator_id" })
  facilitator!: User;

  @Column("uuid")
  facilitator_id!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}