
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Story } from "./Story";
import { User } from "./User";

@Entity({ name: "votes" })
export class Vote {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  value!: string; // e.g. "3", "5", "No Vote"

  @Column({ default: true })
  isRevealed!: boolean;

  @ManyToOne(() => Story)
  @JoinColumn({ name: "story_id" })
  story!: Story;

  @Column("uuid")
  story_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column("uuid")
  user_id!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}