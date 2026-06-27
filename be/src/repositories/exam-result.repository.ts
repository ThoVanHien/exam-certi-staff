import { AppDataSource } from "../config/data-source";
import { ExamResult } from "../entities/exam-result.entity";

export const examResultRepository = AppDataSource.getRepository(ExamResult);
