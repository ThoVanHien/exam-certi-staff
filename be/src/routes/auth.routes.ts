import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const authRouter = Router();

authRouter.post("/login", asyncHandler(AuthController.login));
authRouter.post("/logout", asyncHandler(AuthController.logout));
authRouter.get("/me", asyncHandler(authenticate), asyncHandler(AuthController.me));

export { authRouter };
