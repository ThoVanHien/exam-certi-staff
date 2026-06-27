import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MoreThan, IsNull } from "typeorm";
import { userSessionRepository } from "../repositories/user-session.repository";
import { AppError } from "../utils/app-error";
import { verifyAccessToken } from "../utils/token";
import type { AuthenticatedRequest } from "../types/express";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new AppError("Ban chua dang nhap", StatusCodes.UNAUTHORIZED);
    }

    const token = authorization.replace("Bearer ", "").trim();
    const payload = verifyAccessToken(token);

    const session = await userSessionRepository.findOne({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date())
      }
    });

    if (!session) {
      throw new AppError("Session da het han hoac da bi thu hoi", StatusCodes.UNAUTHORIZED);
    }

    (req as AuthenticatedRequest).authUser = payload;
    next();
  } catch (error) {
    next(
      error instanceof AppError
        ? error
        : new AppError("Token khong hop le hoac da het han", StatusCodes.UNAUTHORIZED)
    );
  }
};
