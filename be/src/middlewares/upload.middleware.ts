import fs from "fs";
import multer from "multer";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";

fs.mkdirSync(env.CERT_STORAGE_PATH, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.CERT_STORAGE_PATH);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeFileName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${timestamp}-${safeFileName}`);
  }
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg"];

  if (!allowedExtensions.includes(ext)) {
    cb(new AppError("Chi cho phep upload file PDF hoac anh JPG/PNG", StatusCodes.BAD_REQUEST));
    return;
  }

  cb(null, true);
};

export const certificateUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE
  }
});
