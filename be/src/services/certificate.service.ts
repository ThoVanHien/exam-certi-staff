import path from "path";
import { StatusCodes } from "http-status-codes";
import { certificateRepository } from "../repositories/certificate.repository";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../utils/app-error";

interface UploadCertificateInput {
  userId: number;
  title: string;
  issueDate: string;
  expiryDate?: string;
  file: Express.Multer.File;
}

export class CertificateService {
  static async uploadCertificate(input: UploadCertificateInput) {
    const user = await userRepository.findOne({
      where: { id: input.userId }
    });

    if (!user) {
      throw new AppError("Khong tim thay nhan vien", StatusCodes.NOT_FOUND);
    }

    const certificate = certificateRepository.create({
      userId: input.userId,
      title: input.title,
      issueDate: input.issueDate,
      expiryDate: input.expiryDate || null,
      // Luu duong dan that tren may chu de de backup va truy xuat noi bo.
      filePath: path.resolve(input.file.path)
    });

    return certificateRepository.save(certificate);
  }
}
