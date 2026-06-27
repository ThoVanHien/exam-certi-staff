import { Router } from "express";
import { ExamController } from "../controllers/exam.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const examRouter = Router();

// Lay danh sach de thi active
examRouter.get("/", asyncHandler(authenticate), asyncHandler(ExamController.list));

// Lay lich su ket qua thi cua toi
examRouter.get("/my-results", asyncHandler(authenticate), asyncHandler(ExamController.getMyResults));

// Lay chi tiet cau hoi de thi
examRouter.get("/:examId", asyncHandler(authenticate), asyncHandler(ExamController.getDetail));

// Nop bai thi trac nghiem, tinh diem va luu lich su lam bai.
examRouter.post("/:examId/submit", asyncHandler(authenticate), asyncHandler(ExamController.submit));

export { examRouter };
