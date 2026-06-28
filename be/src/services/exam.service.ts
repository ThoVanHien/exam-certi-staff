import { examRepository } from "../repositories/exam.repository";

export class ExamService {
  static async getAllExams() {
    const exams = await examRepository.find({
      order: {
        id: "ASC"
      }
    });

    return exams.map(e => {
      // Map backend status to frontend status
      let mappedStatus: "Published" | "Draft" | "Archived" = "Draft";
      if (e.status === "PUBLISHED") {
        mappedStatus = "Published";
      } else if (e.status === "ARCHIVED") {
        mappedStatus = "Archived";
      }

      // Map backend partCode to frontend department names
      let mappedDept = "Production";
      if (e.partCode === "WM-PROD-P") {
        mappedDept = "Production";
      } else if (e.partCode === "WM-QUAL-P") {
        mappedDept = "Quality";
      } else if (e.partCode === "WM-IT-P") {
        mappedDept = "IT";
      } else if (e.partCode === "WM-MAIN-P") {
        mappedDept = "Maintenance";
      } else if (e.partCode === "WM-LOGI-P") {
        mappedDept = "Logistics";
      } else if (e.partCode) {
        mappedDept = e.partCode;
      }

      return {
        id: Number(e.id),
        code: e.examCode,
        title: e.title,
        description: e.description || "",
        department: mappedDept,
        createdBy: e.createdBy || "admin",
        questionCount: e.totalQuestions || 0,
        durationMinutes: e.durationMinutes || 30,
        status: mappedStatus
      };
    });
  }

  static async deleteExam(id: number) {
    const exam = await examRepository.findOne({ where: { id } });
    if (!exam) {
      throw new Error("Exam not found");
    }
    await examRepository.remove(exam);
    return true;
  }
}
