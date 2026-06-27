import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CertificateService } from "../services/certificate.service";
import { uploadCertificateSchema } from "../validators/certificate.validator";
import { AppError } from "../utils/app-error";
import { env } from "../config/env";
import path from "path";
import fs from "fs";

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

  static async uploadTemplate(req: Request, res: Response) {
    if (!req.file) {
      throw new AppError("Vui long chon file anh lam template", StatusCodes.BAD_REQUEST);
    }

    const targetDir = env.CERT_STORAGE_PATH;
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    // Clean up old template files
    const possibleExts = [".png", ".jpg", ".jpeg"];
    for (const pExt of possibleExts) {
      const oldFile = path.join(targetDir, `template${pExt}`);
      if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
      }
    }

    const targetPath = path.join(targetDir, `template${ext}`);
    fs.renameSync(req.file.path, targetPath);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Da upload template thanh cong",
      data: {
        exists: true,
        url: `http://localhost:3000/uploads/certificates/template${ext}?t=${Date.now()}`
      }
    });
  }

  static async getTemplate(req: Request, res: Response) {
    const targetDir = env.CERT_STORAGE_PATH;
    const possibleExts = [".png", ".jpg", ".jpeg"];
    let foundExt = "";
    
    for (const pExt of possibleExts) {
      if (fs.existsSync(path.join(targetDir, `template${pExt}`))) {
        foundExt = pExt;
        break;
      }
    }

    if (foundExt) {
      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          exists: true,
          url: `http://localhost:3000/uploads/certificates/template${foundExt}?t=${Date.now()}`
        }
      });
    } else {
      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          exists: false
        }
      });
    }
  }
}
