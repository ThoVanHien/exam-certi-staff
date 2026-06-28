import { Request, Response, NextFunction } from "express";
import { ExamService } from "../services/exam.service";
import { StatusCodes } from "http-status-codes";

export class ExamController {
  static async getAllExams(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ExamService.getAllExams();
      res.status(StatusCodes.OK).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteExam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      await ExamService.deleteExam(id);
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Exam deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
}
