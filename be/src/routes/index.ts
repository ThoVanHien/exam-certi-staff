import { Router } from "express";
import { authRouter } from "./auth.routes";
import { certificateRouter } from "./certificate.routes";
import { examRouter } from "./exam.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/certificates", certificateRouter);
apiRouter.use("/exams", examRouter);

export { apiRouter };
