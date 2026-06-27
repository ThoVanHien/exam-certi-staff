import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface AccessTokenPayload {
  userId: number;
  email: string;
  role: string;
  department: string;
  sessionId: number;
}

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(48).toString("hex");
};

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
