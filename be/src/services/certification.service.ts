import { StatusCodes } from "http-status-codes";
import { AppDataSource } from "../config/data-source";
import { ApprovalRequest } from "../entities/approval-request.entity";
import { CertificateResult } from "../entities/certificate-result.entity";
import { Exam } from "../entities/exam.entity";
import { ExamResult } from "../entities/exam-result.entity";
import { Inspector } from "../entities/inspector.entity";
import { AppError } from "../utils/app-error";
import type { AuthenticatedRequest } from "../types/express";
import type { CreateCertificationInput } from "../validators/certification.validator";

export class CertificationService {
  static async createCertification(
    payload: CreateCertificationInput,
    authUser?: AuthenticatedRequest["authUser"]
  ) {
    return AppDataSource.transaction(async (manager) => {
      const inspectorRepo = manager.getRepository(Inspector);
      const examRepo = manager.getRepository(Exam);
      const examResultRepo = manager.getRepository(ExamResult);
      const certificateRepo = manager.getRepository(CertificateResult);
      const approvalRepo = manager.getRepository(ApprovalRequest);

      const inspector = await inspectorRepo.findOne({
        where: {
          eid: payload.inspectorEid,
          isActive: true
        }
      });

      if (!inspector) {
        throw new AppError("Inspector not found", StatusCodes.NOT_FOUND);
      }

      const exam = await examRepo.findOne({
        where: {
          examCode: payload.examCode
        }
      });

      if (!exam) {
        throw new AppError("Exam not found", StatusCodes.NOT_FOUND);
      }

      const passingScore = Number(exam.passingScore);
      const examScore = Number(payload.examScore);
      const createdBy = authUser?.email || "system";
      const resultStatus = examScore >= passingScore ? "PASSED" : "FAILED";

      const examResult = examResultRepo.create({
        inspectorId: inspector.id,
        examId: exam.id,
        partCodeSnapshot: exam.partCode,
        examCodeSnapshot: exam.examCode,
        examTitleSnapshot: exam.title,
        passingScoreSnapshot: exam.passingScore,
        totalQuestionsSnapshot: exam.totalQuestions,
        certificateValidMonthsSnapshot: exam.certificateValidMonths,
        trainingStartDate: payload.trainingStartDate,
        trainingEndDate: payload.trainingEndDate,
        examDate: payload.examDate,
        score: examScore.toFixed(2),
        resultStatus,
        remark: payload.remark || null,
        createdBy
      });

      const savedExamResult = await examResultRepo.save(examResult);

      const hasCertificateData = Boolean(
        payload.certificateNo || payload.certificateDate || payload.expireDate
      );

      let savedCertificate: CertificateResult | null = null;

      if (hasCertificateData) {
        const certificateStatus =
          payload.certificateDate && payload.expireDate
            ? new Date(payload.expireDate).getTime() < Date.now()
              ? "EXPIRED"
              : "ACTIVE"
            : "NOT_ISSUED";

        savedCertificate = await certificateRepo.save(
          certificateRepo.create({
            inspectorId: inspector.id,
            examResultId: savedExamResult.id,
            certificateNo: payload.certificateNo || null,
            effectiveDate: payload.certificateDate || null,
            expireDate: payload.expireDate || null,
            certificateValidMonthsSnapshot: exam.certificateValidMonths,
            certificateStatus,
            createdBy
          })
        );
      }

      const approvalOwner = payload.approver || createdBy;

      const approvalRequest = approvalRepo.create({
        examResultId: savedExamResult.id,
        certificateResultId: savedCertificate?.id ?? null,
        approvalStatus: payload.approvalStatus,
        requestedBy: payload.approvalStatus === "APPROVED" ? createdBy : approvalOwner,
        requestedAt:
          payload.approvalStatus === "WAITING_APPROVAL" || payload.approvalStatus === "APPROVED"
            ? new Date()
            : null,
        approvedBy: payload.approvalStatus === "APPROVED" ? approvalOwner : null,
        approvedAt: payload.approvalStatus === "APPROVED" ? new Date() : null,
        rejectedBy: payload.approvalStatus === "REJECTED" ? approvalOwner : null,
        rejectedAt: payload.approvalStatus === "REJECTED" ? new Date() : null,
        cancelledBy: payload.approvalStatus === "CANCELLED" ? approvalOwner : null,
        cancelledAt: payload.approvalStatus === "CANCELLED" ? new Date() : null
      });

      const savedApproval = await approvalRepo.save(approvalRequest);

      return {
        examCode: savedExamResult.examCodeSnapshot || exam.examCode,
        trainingStartDate: savedExamResult.trainingStartDate || "",
        trainingEndDate: savedExamResult.trainingEndDate || "",
        examDate: savedExamResult.examDate || "",
        examScore,
        passingScore,
        approvalStatus: savedApproval.approvalStatus,
        certificateNo: savedCertificate?.certificateNo || "",
        certificateDate: savedCertificate?.effectiveDate || "",
        expireDate: savedCertificate?.expireDate || "",
        approver: savedApproval.approvedBy || savedApproval.requestedBy || "",
        certificateFileName: payload.certificateFileName || ""
      };
    });
  }
}
