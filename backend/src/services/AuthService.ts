// src/services/AuthService.ts

import { Repository, DataSource } from "typeorm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";

export class AuthService {
  private userRepository: Repository<User>;

  constructor(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
  }

  async signup(email: string, password: string, name: string) {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      email,
      passwordHash: hashedPassword,
      name,
    });

    await this.userRepository.save(user);

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    return { user, accessToken };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    return { user, accessToken };
  }
}