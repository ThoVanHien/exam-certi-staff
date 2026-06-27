import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
  file?: Express.Multer.File;
  authUser?: {
    userId: number;
    email: string;
    role: string;
    department: string;
    sessionId: number;
  };
}
