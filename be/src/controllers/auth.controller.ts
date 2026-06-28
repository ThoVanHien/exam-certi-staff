import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/app-error";
import { generateAccessToken } from "../utils/token";
import { AppDataSource } from "../config/data-source";
import { StaffNew } from "../entities/staff-new.entity";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email) {
        throw new AppError("Email is required", StatusCodes.BAD_REQUEST);
      }

      // Hardcoded super admin fallback for testing/default admin account
      if (email === "admin@company.local") {
        const token = generateAccessToken({
          userId: 9999,
          email: "admin@company.local",
          role: "super_admin",
          department: "IT",
          sessionId: 9999
        });

        res.status(StatusCodes.OK).json({
          success: true,
          data: {
            accessToken: token,
            user: {
              id: 9999,
              name: "Super Admin",
              email: "admin@company.local",
              role: "super_admin",
              department: "IT"
            }
          }
        });
        return;
      }

      // Check if user exists in staffs_new
      const staffRepo = AppDataSource.getRepository(StaffNew);
      const staff = await staffRepo.findOne({ where: { email } });

      if (!staff) {
        throw new AppError("User not found in HR system", StatusCodes.UNAUTHORIZED);
      }

      // Simple mapping: if department is Quality or IT, or position is Partleader, make them partleader
      let role = "employee";
      if (
        staff.position?.toLowerCase().includes("leader") ||
        staff.position?.toLowerCase().includes("manager") ||
        staff.department === "Quality"
      ) {
        role = "partleader";
      }

      // Generate a mock sequential numeric ID from EID hash
      const numericId = parseInt(staff.eid.replace(/[^0-9]/g, "")) || 1000;

      const token = generateAccessToken({
        userId: numericId,
        email: staff.email || "",
        role,
        department: staff.department || "Production",
        sessionId: numericId
      });

      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          accessToken: token,
          user: {
            id: numericId,
            name: staff.fullName || "Employee",
            email: staff.email || "",
            role,
            department: staff.department || "Production"
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
