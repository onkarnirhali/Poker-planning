import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";       // we’ll create this entity next
import { Session } from "./entities/Session"; // etc.
import { Story } from "./entities/Story";
import { Vote } from "./entities/Vote";
import { ChatMessage } from "./entities/ChatMessage";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,       // use migrations in the future; false for production safety
  logging: false,
  entities: [User, Session, Story, Vote, ChatMessage],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
});