import { DataSource } from "typeorm";
import { env } from "./env";
import { User } from "../entities/user.entity";
import { Certificate } from "../entities/certificate.entity";
import { Exam } from "../entities/exam.entity";
import { ExamQuestion } from "../entities/exam-question.entity";
import { ExamResult } from "../entities/exam-result.entity";
import { UserSession } from "../entities/user-session.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.DB_HOST,
  port: env.DB_PORT,
  extra: env.DB_SOCKET_PATH
    ? {
        socketPath: env.DB_SOCKET_PATH
      }
    : undefined,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: env.DB_SYNC,
  logging: env.DB_LOGGING,
  entities: [User, Certificate, Exam, ExamQuestion, ExamResult, UserSession]
});
