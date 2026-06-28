import { AppDataSource } from "../config/data-source";
import { Inspector } from "../entities/inspector.entity";

export const inspectorRepository = AppDataSource.getRepository(Inspector);
