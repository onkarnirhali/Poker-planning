// src/entities/ChatMessage.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Session } from "./Session";
import { User } from "./User";

@Entity({ name: "chat_messages" })
export class ChatMessage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  message!: string;

  @ManyToOne(() => Session)
  @JoinColumn({ name: "session_id" })
  session!: Session;

  @Column("uuid")
  session_id!: string;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "user_id" })
  user!: User | null;

  @Column("uuid", { nullable: true })
  user_id!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}