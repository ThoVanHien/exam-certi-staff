import { Router } from "express";
import { CertificateController } from "../controllers/certificate.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { certificateUpload } from "../middlewares/upload.middleware";
import { asyncHandler } from "../utils/async-handler";

const certificateRouter = Router();

// Upload file chung chi va luu metadata vao DB.
certificateRouter.post(
  "/upload",
  asyncHandler(authenticate),
  certificateUpload.single("file"),
  asyncHandler(CertificateController.upload)
);

export { certificateRouter };
