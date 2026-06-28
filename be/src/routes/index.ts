import { Router } from "express";
import { certificationRouter } from "./certification.routes";
import { inspectorRouter } from "./inspector.routes";
import { authRouter } from "./auth.routes";
import { ExamController } from "../controllers/exam.controller";
import { authenticate } from "../middlewares/auth.middleware";

const apiRouter = Router();

apiRouter.use("/inspectors", inspectorRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/certifications", certificationRouter);

// Real exams endpoint
apiRouter.get("/exams", authenticate, ExamController.getAllExams);
apiRouter.delete("/exams/:id", authenticate, ExamController.deleteExam);

// Stub routes to satisfy frontend initial loads
apiRouter.get("/exams/my-results", (_req, res) => {
  res.json({ success: true, data: [] });
});
apiRouter.get("/certificates/template", (_req, res) => {
  res.json({ success: true, data: { exists: false } });
});

export { apiRouter };
