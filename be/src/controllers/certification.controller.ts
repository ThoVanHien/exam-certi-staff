import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { CertificationService } from "../services/certification.service";
import type { AuthenticatedRequest } from "../types/express";
import { AppError } from "../utils/app-error";
import { createCertificationSchema } from "../validators/certification.validator";

export class CertificationController {
  static async createCertification(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload = createCertificationSchema.parse(req.body);
      const data = await CertificationService.createCertification(payload, req.authUser);

      res.status(StatusCodes.CREATED).json({
        success: true,
        data
      });
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(error.issues[0]?.message || "Invalid certification payload", StatusCodes.BAD_REQUEST));
        return;
      }

      next(error);
    }
  }
}
