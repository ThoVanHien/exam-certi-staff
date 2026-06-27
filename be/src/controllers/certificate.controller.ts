import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CertificateService } from "../services/certificate.service";
import { uploadCertificateSchema } from "../validators/certificate.validator";
import { AppError } from "../utils/app-error";

export class CertificateController {
  static async upload(req: Request, res: Response) {
    if (!req.file) {
      throw new AppError("Vui long chon file chung chi", StatusCodes.BAD_REQUEST);
    }

    const payload = uploadCertificateSchema.parse(req.body);
    const certificate = await CertificateService.uploadCertificate({
      userId: payload.userId,
      title: payload.title,
      issueDate: payload.issueDate,
      expiryDate: payload.expiryDate || undefined,
      file: req.file
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: certificate
    });
  }
}
