import { Router } from "express";
import { ExamController } from "../controllers/exam.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const examRouter = Router();

// Nop bai thi trac nghiem, tinh diem va luu lich su lam bai.
examRouter.post("/:examId/submit", asyncHandler(authenticate), asyncHandler(ExamController.submit));

export { examRouter };
