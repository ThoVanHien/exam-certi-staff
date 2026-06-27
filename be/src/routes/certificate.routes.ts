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

// Get template certificate
certificateRouter.get(
  "/template",
  asyncHandler(authenticate),
  asyncHandler(CertificateController.getTemplate)
);

// Upload template certificate
certificateRouter.post(
  "/template",
  asyncHandler(authenticate),
  certificateUpload.single("file"),
  asyncHandler(CertificateController.uploadTemplate)
);

export { certificateRouter };
