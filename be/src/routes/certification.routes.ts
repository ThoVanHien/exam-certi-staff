import { Router } from "express";
import { CertificationController } from "../controllers/certification.controller";
import { authenticate } from "../middlewares/auth.middleware";

const certificationRouter = Router();

certificationRouter.post("/", authenticate, CertificationController.createCertification);

export { certificationRouter };
