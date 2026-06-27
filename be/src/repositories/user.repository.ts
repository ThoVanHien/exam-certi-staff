import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";

export const userRepository = AppDataSource.getRepository(User);
