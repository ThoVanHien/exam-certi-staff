import { StatusCodes } from "http-status-codes";
import { examRepository } from "../repositories/exam.repository";
import { examResultRepository } from "../repositories/exam-result.repository";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../utils/app-error";

interface SubmitExamAnswer {
  questionId: number;
  answer: string;
}

interface SubmitExamInput {
  examId: number;
  userId: number;
  answers: SubmitExamAnswer[];
}

export class ExamService {
  static async getExamsForUser(role: string, department: string) {
    const filter = role === "super_admin" ? {} : { department };
    const exams = await examRepository.find({
      where: filter,
      order: {
        id: "DESC"
      }
    });
    return exams;
  }

  static async getMyResults(userId: number) {
    return examResultRepository.find({
      where: { userId },
      relations: {
        exam: true
      },
      order: {
        completedAt: "DESC"
      }
    });
  }

  static async getExamForTaking(examId: number) {
    const exam = await examRepository.findOne({
      where: { id: examId },
      relations: {
        questions: true
      }
    });

    if (!exam) {
      throw new AppError("Khong tim thay de thi", StatusCodes.NOT_FOUND);
    }

    // Strip correct answers to prevent cheating
    const secureQuestions = exam.questions
      .sort((a, b) => a.orderNo - b.orderNo)
      .map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        orderNo: q.orderNo
      }));

    return {
      id: exam.id,
      title: exam.title,
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      questions: secureQuestions
    };
  }

  static async submitExam(input: SubmitExamInput) {
    const [user, exam] = await Promise.all([
      userRepository.findOne({ where: { id: input.userId } }),
      examRepository.findOne({
        where: { id: input.examId },
        relations: {
          questions: true
        }
      })
    ]);

    if (!user) {
      throw new AppError("Khong tim thay nhan vien", StatusCodes.NOT_FOUND);
    }

    if (!exam) {
      throw new AppError("Khong tim thay de thi", StatusCodes.NOT_FOUND);
    }

    if (!exam.questions.length) {
      throw new AppError("De thi chua co cau hoi", StatusCodes.BAD_REQUEST);
    }

    const answerMap = new Map(
      input.answers.map((item) => [item.questionId, item.answer.trim().toLowerCase()])
    );

    let correctAnswers = 0;

    for (const question of exam.questions) {
      const userAnswer = answerMap.get(question.id);

      if (userAnswer && userAnswer === question.correctAnswer.trim().toLowerCase()) {
        correctAnswers += 1;
      }
    }

    const totalQuestions = exam.questions.length;
    const score = Number(((correctAnswers / totalQuestions) * 100).toFixed(2));
    const status = score >= 70 ? "passed" : "failed";

    const examResult = examResultRepository.create({
      userId: input.userId,
      examId: input.examId,
      score: score.toFixed(2),
      status,
      correctAnswers,
      answeredQuestions: input.answers.length,
      completedAt: new Date()
    });

    const savedResult = await examResultRepository.save(examResult);

    return {
      resultId: savedResult.id,
      examId: input.examId,
      userId: input.userId,
      totalQuestions,
      correctAnswers,
      answeredQuestions: input.answers.length,
      score,
      status,
      completedAt: savedResult.completedAt
    };
  }
}
