import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ExamService } from "../services/exam.service";
import { submitExamSchema } from "../validators/exam.validator";
import type { AuthenticatedRequest } from "../types/express";

export class ExamController {
  static async submit(req: Request, res: Response) {
    const examId = Number(req.params.examId);
    const payload = submitExamSchema.parse(req.body);
    const authUser = (req as AuthenticatedRequest).authUser!;

    const result = await ExamService.submitExam({
      examId,
      userId: authUser.userId,
      answers: payload.answers
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  }
}
