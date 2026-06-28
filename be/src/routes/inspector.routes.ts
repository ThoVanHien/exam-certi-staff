import { Router } from "express";
import { InspectorController } from "../controllers/inspector.controller";
import { authenticate } from "../middlewares/auth.middleware";

const inspectorRouter = Router();

// Get list of all inspectors
inspectorRouter.get("/", authenticate, InspectorController.getAllInspectors);

export { inspectorRouter };
