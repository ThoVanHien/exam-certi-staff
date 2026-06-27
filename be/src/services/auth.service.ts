import { StatusCodes } from "http-status-codes";
import { MoreThan, IsNull } from "typeorm";
import { env } from "../config/env";
import { userRepository } from "../repositories/user.repository";
import { userSessionRepository } from "../repositories/user-session.repository";
import { AppError } from "../utils/app-error";
import { comparePassword } from "../utils/hash";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken
} from "../utils/token";

interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AuthService {
  static async login(input: LoginInput) {
    const user = await userRepository.findOne({
      where: {
        email: input.email
      }
    });

    if (!user || !user.isActive) {
      throw new AppError("Thong tin dang nhap khong hop le", StatusCodes.UNAUTHORIZED);
    }

    const isMatched = await comparePassword(input.password, user.passwordHash);

    if (!isMatched) {
      throw new AppError("Thong tin dang nhap khong hop le", StatusCodes.UNAUTHORIZED);
    }

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_EXPIRES_IN_DAYS);

    const session = await userSessionRepository.save(
      userSessionRepository.create({
        userId: user.id,
        refreshTokenHash,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        expiresAt,
        revokedAt: null
      })
    );

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
      sessionId: session.id
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    };
  }

  static async logout(refreshToken: string) {
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const session = await userSessionRepository.findOne({
      where: {
        refreshTokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date())
      }
    });

    if (!session) {
      throw new AppError("Session khong hop le hoac da het han", StatusCodes.UNAUTHORIZED);
    }

    session.revokedAt = new Date();
    await userSessionRepository.save(session);
  }

  static async getProfile(userId: number) {
    const user = await userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError("Khong tim thay nhan vien", StatusCodes.NOT_FOUND);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive
    };
  }
}
