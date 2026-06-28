import { DataSource } from "typeorm";
import { env } from "./env";
import { Plant } from "../entities/plant.entity";
import { InspectionProcess } from "../entities/process.entity";
import { DetailProcess } from "../entities/detail-process.entity";
import { Inspector } from "../entities/inspector.entity";
import { Exam } from "../entities/exam.entity";
import { ExamQuestion } from "../entities/exam-question.entity";
import { ExamResult } from "../entities/exam-result.entity";
import { ExamResultAnswer } from "../entities/exam-result-answer.entity";
import { CertificateResult } from "../entities/certificate-result.entity";
import { ApprovalRequest } from "../entities/approval-request.entity";
import { History } from "../entities/history.entity";
import { StaffNew } from "../entities/staff-new.entity";

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
  entities: [
    Plant,
    InspectionProcess,
    DetailProcess,
    Inspector,
    Exam,
    ExamQuestion,
    ExamResult,
    ExamResultAnswer,
    CertificateResult,
    ApprovalRequest,
    History,
    StaffNew
  ]
});
