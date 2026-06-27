import { AppDataSource } from "../config/data-source";
import { ExamQuestion } from "../entities/exam-question.entity";

export const examQuestionRepository = AppDataSource.getRepository(ExamQuestion);
