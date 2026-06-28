import { Request, Response, NextFunction } from "express";
import { InspectorService } from "../services/inspector.service";
import { StatusCodes } from "http-status-codes";

export class InspectorController {
  static async getAllInspectors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await InspectorService.getAllInspectors();
      res.status(StatusCodes.OK).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}
