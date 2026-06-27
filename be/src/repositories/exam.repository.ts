import { AppDataSource } from "../config/data-source";
import { Exam } from "../entities/exam.entity";

export const examRepository = AppDataSource.getRepository(Exam);
