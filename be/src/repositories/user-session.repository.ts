import { AppDataSource } from "../config/data-source";
import { UserSession } from "../entities/user-session.entity";

export const userSessionRepository = AppDataSource.getRepository(UserSession);
