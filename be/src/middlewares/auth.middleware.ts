import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/app-error";
import { verifyAccessToken } from "../utils/token";
import type { AuthenticatedRequest } from "../types/express";

/**
 * TODO: Auth middleware is simplified for now.
 * staffs_new integration (Knox ID / EID based auth) should be implemented here
 * in a future version when the HR data source connection is configured.
 */
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
