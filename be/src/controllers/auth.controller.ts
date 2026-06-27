import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "../services/auth.service";
import { logoutSchema, loginSchema } from "../validators/auth.validator";
import type { AuthenticatedRequest } from "../types/express";

export class AuthController {
  static async login(req: Request, res: Response) {
    const payload = loginSchema.parse(req.body);

    const result = await AuthService.login({
      email: payload.email,
      password: payload.password,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] ?? null
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  }

  static async logout(req: Request, res: Response) {
    const payload = logoutSchema.parse(req.body);
    await AuthService.logout(payload.refreshToken);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Dang xuat thanh cong"
    });
  }

  static async me(req: Request, res: Response) {
    const profile = await AuthService.getProfile((req as AuthenticatedRequest).authUser!.userId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: profile
    });
  }
}
