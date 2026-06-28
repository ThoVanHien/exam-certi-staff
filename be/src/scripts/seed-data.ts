import "reflect-metadata";
import { AppDataSource } from "../config/data-source";
import { Plant } from "../entities/plant.entity";
import { InspectionProcess } from "../entities/process.entity";
import { DetailProcess } from "../entities/detail-process.entity";
import { StaffNew } from "../entities/staff-new.entity";
import { Inspector } from "../entities/inspector.entity";
import { Exam } from "../entities/exam.entity";
import { ExamQuestion } from "../entities/exam-question.entity";
import { ExamResult } from "../entities/exam-result.entity";
import { ExamResultAnswer } from "../entities/exam-result-answer.entity";
import { CertificateResult } from "../entities/certificate-result.entity";
import { ApprovalRequest } from "../entities/approval-request.entity";
import { History } from "../entities/history.entity";

async function main() {
  await AppDataSource.initialize();
  console.log("Database connected for seeding MCQ schema.");

  // Clear tables
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.query("SET FOREIGN_KEY_CHECKS = 0");
  await queryRunner.query("TRUNCATE TABLE histories");
  await queryRunner.query("TRUNCATE TABLE approval_requests");
  await queryRunner.query("TRUNCATE TABLE certificate_results");
  await queryRunner.query("TRUNCATE TABLE exam_result_answers");
  await queryRunner.query("TRUNCATE TABLE exam_results");
  await queryRunner.query("TRUNCATE TABLE exam_questions");
  await queryRunner.query("TRUNCATE TABLE exams");
  await queryRunner.query("TRUNCATE TABLE inspectors");
  await queryRunner.query("TRUNCATE TABLE staffs_new");
  await queryRunner.query("TRUNCATE TABLE detail_processes");
  await queryRunner.query("TRUNCATE TABLE processes");
  await queryRunner.query("TRUNCATE TABLE plants");
  await queryRunner.query("SET FOREIGN_KEY_CHECKS = 1");
  console.log("Cleared existing data.");

  // Seed Plant
  const plantRepo = AppDataSource.getRepository(Plant);
  const plant = plantRepo.create({
    code: "P553",
    name: "SEHC",
    isActive: true
  });
  await plantRepo.save(plant);

  // Seed Process
  const processRepo = AppDataSource.getRepository(InspectionProcess);
  const process = processRepo.create({
    code: "CS",
    name: "Customer Satisfaction",
    isActive: true
  });
  await processRepo.save(process);

  // Seed Detail Processes
  const detailRepo = AppDataSource.getRepository(DetailProcess);
  const iqc = detailRepo.create({
    processId: process.id,
    code: "IQC",
    name: "Incoming Quality Control",
    isActive: true
  });
  const oqcMass = detailRepo.create({
    processId: process.id,
    code: "OQC/Mass",
    name: "Outbound Quality Control & Mass",
    isActive: true
  });
  await detailRepo.save([iqc, oqcMass]);

  // Seed staffs_new
  const staffRepo = AppDataSource.getRepository(StaffNew);
  const staffs = [
    staffRepo.create({
      eid: "SEHC-001",
      knoxId: "vanan.ng",
      fullName: "Nguyen Van An",
      email: "vanan.ng@company.local",
      department: "Production",
      team: "Line A",
      product: "W/M",
      position: "Inspector",
      status: "Working"
    }),
    staffRepo.create({
      eid: "SEHC-014",
      knoxId: "hoa.tt",
      fullName: "Tran Thi Hoa",
      email: "hoa.tt@company.local",
      department: "Quality",
      team: "QA Incoming",
      product: "W/M",
      position: "Inspector",
      status: "Working"
    }),
    staffRepo.create({
      eid: "SEHC-017",
      knoxId: "tuan.dm",
      fullName: "Do Minh Tuan",
      email: "tuan.dm@company.local",
      department: "IT",
      team: "System Support",
      product: "W/M",
      position: "Inspector",
      status: "Working"
    }),
    staffRepo.create({
      eid: "SEHC-028",
      knoxId: "minh.lq",
      fullName: "Le Quang Minh",
      email: "minh.lq@company.local",
      department: "Maintenance",
      team: "Preventive Maintenance",
      product: "W/M",
      position: "Inspector",
      status: "Working"
    }),
    staffRepo.create({
      eid: "SEHC-033",
      knoxId: "trang.pt",
      fullName: "Pham Thu Trang",
      email: "trang.pt@company.local",
      department: "Logistics",
      team: "Outbound Quality",
      product: "W/M",
      position: "Inspector",
      status: "Working"
    })
  ];
  await staffRepo.save(staffs);

  // Seed all 6 exams from static frontend data
  const examRepo = AppDataSource.getRepository(Exam);
  
  const exam1 = examRepo.create({
    partCode: "WM-PROD-P",
    examCode: "EX-SEHC-001",
    title: "Forklift Operation Safety Assessment",
    description: "Assess forklift safety, loading protocol, and warehouse movement procedure.",
    durationMinutes: 30,
    passingScore: "95.00",
    totalQuestions: 5,
    certificateValidMonths: 24,
    status: "PUBLISHED",
    versionNo: 1,
    createdBy: "xuantruong.d",
    publishedBy: "xuantruong.d",
    publishedAt: new Date()
  });

  const exam2 = examRepo.create({
    partCode: "WM-QUAL-P",
    examCode: "EX-SEHC-002",
    title: "Safety Compliance Annual Re-Certification",
    description: "Evaluate compliance knowledge for line safety, PPE usage, and emergency response.",
    durationMinutes: 35,
    passingScore: "95.00",
    totalQuestions: 5,
    certificateValidMonths: 24,
    status: "PUBLISHED",
    versionNo: 1,
    createdBy: "lethuy.bui",
    publishedBy: "lethuy.bui",
    publishedAt: new Date()
  });

  const exam3 = examRepo.create({
    partCode: "WM-IT-P",
    examCode: "EX-SEHC-003",
    title: "System Security Fundamentals",
    description: "Check employee awareness around account security, data handling, and phishing prevention.",
    durationMinutes: 25,
    passingScore: "95.00",
    totalQuestions: 5,
    certificateValidMonths: 24,
    status: "DRAFT",
    versionNo: 1,
    createdBy: "mysuong.nt"
  });

  const exam4 = examRepo.create({
    partCode: "WM-MAIN-P",
    examCode: "EX-SEHC-004",
    title: "Electrical Safety Maintenance Exam",
    description: "Measure lockout-tagout knowledge and preventive maintenance safety process.",
    durationMinutes: 30,
    passingScore: "95.00",
    totalQuestions: 5,
    certificateValidMonths: 24,
    status: "PUBLISHED",
    versionNo: 1,
    createdBy: "tuoanh.ng",
    publishedBy: "tuoanh.ng",
    publishedAt: new Date()
  });

  const exam5 = examRepo.create({
    partCode: "WM-LOGI-P",
    examCode: "EX-SEHC-005",
    title: "Warehouse Handling Re-Test",
    description: "Retest for warehouse flow, scanner usage, pallet staging, and loading compliance.",
    durationMinutes: 20,
    passingScore: "95.00",
    totalQuestions: 5,
    certificateValidMonths: 24,
    status: "ARCHIVED",
    versionNo: 1,
    createdBy: "phanvi.n"
  });

  const exam6 = examRepo.create({
    partCode: "WM-QUAL-P",
    examCode: "EX-SEHC-006",
    title: "New Hire Quality Orientation",
    description: "Orientation quiz for inspection basics, reporting defects, and quality escalation flow.",
    durationMinutes: 15,
    passingScore: "95.00",
    totalQuestions: 5,
    certificateValidMonths: 24,
    status: "DRAFT",
    versionNo: 2,
    createdBy: "manhcuong.n"
  });

  await examRepo.save([exam1, exam2, exam3, exam4, exam5, exam6]);

  // Seed Questions for all exams
  const questionRepo = AppDataSource.getRepository(ExamQuestion);
  const qList: ExamQuestion[] = [];

  // 5 questions for Exam 1
  const exam1Questions = [
    questionRepo.create({
      examId: exam1.id,
      questionNo: 1,
      questionText: "What is the maximum speed limit for forklifts in warehouse aisles?",
      optionA: "5 km/h",
      optionB: "10 km/h",
      optionC: "15 km/h",
      optionD: "20 km/h",
      correctAnswer: "A",
      score: "20.00",
      explanation: "Forklifts must navigate warehouse aisles at a safe speed of 5 km/h."
    }),
    questionRepo.create({
      examId: exam1.id,
      questionNo: 2,
      questionText: "When parked, a forklift's forks should be:",
      optionA: "Raised 1 meter off the ground",
      optionB: "Fully lowered to the floor",
      optionC: "Tilted backward",
      optionD: "Tilted forward at an angle",
      correctAnswer: "B",
      score: "20.00",
      explanation: "Forks must be fully lowered to the ground to prevent tripping hazard."
    }),
    questionRepo.create({
      examId: exam1.id,
      questionNo: 3,
      questionText: "How often must forklift safety inspections be performed?",
      optionA: "Monthly",
      optionB: "Weekly",
      optionC: "Daily before use",
      optionD: "Annually",
      correctAnswer: "C",
      score: "20.00",
      explanation: "Inspections should occur daily before the start of each shift."
    }),
    questionRepo.create({
      examId: exam1.id,
      questionNo: 4,
      questionText: "What is the primary action when a forklift starts to tip over?",
      optionA: "Jump out of the cab immediately",
      optionB: "Lean in the opposite direction",
      optionC: "Stay in the cab, hold steering wheel firmly, and brace feet",
      optionD: "Deploy emergency brake",
      correctAnswer: "C",
      score: "20.00",
      explanation: "Safety procedures instruct operators to stay inside the protective frame."
    }),
    questionRepo.create({
      examId: exam1.id,
      questionNo: 5,
      questionText: "Who is permitted to operate forklifts on the production floor?",
      optionA: "Only certified and authorized employees",
      optionB: "Any production operator",
      optionC: "Maintenance team only",
      optionD: "Temporary employees",
      correctAnswer: "A",
      score: "20.00",
      explanation: "Strict compliance requires proper certification before operating machinery."
    })
  ];
  qList.push(...exam1Questions);

  // Default questions for exams 2-6
  const otherExams = [exam2, exam3, exam4, exam5, exam6];
  for (const targetExam of otherExams) {
    for (let qNo = 1; qNo <= 5; qNo++) {
      qList.push(
        questionRepo.create({
          examId: targetExam.id,
          questionNo: qNo,
          questionText: `Assessment Question ${qNo} for ${targetExam.title}?`,
          optionA: "Option A content",
          optionB: "Option B content",
          optionC: "Option C content",
          optionD: "Option D content",
          correctAnswer: "A",
          score: "20.00",
          explanation: "Standard compliance verification response option A."
        })
      );
    }
  }

  await questionRepo.save(qList);

  // Helper function to get questions by examId
  const getQuestionsForExam = (examId: number) => {
    return qList.filter(q => q.examId === examId);
  };

  // Helper function to get staff
  const getStaff = (eid: string) => staffs.find(s => s.eid === eid)!;

  const inspectorRepo = AppDataSource.getRepository(Inspector);
  const examResultRepo = AppDataSource.getRepository(ExamResult);
  const answerRepo = AppDataSource.getRepository(ExamResultAnswer);
  const certResultRepo = AppDataSource.getRepository(CertificateResult);
  const approvalRepo = AppDataSource.getRepository(ApprovalRequest);
  const historyRepo = AppDataSource.getRepository(History);

  // Helper function to seed inspector + exam result + answers + certificate + approval
  const seedInspectorCertFlow = async (
    targetExam: Exam,
    params: {
      eid: string;
      knoxId: string;
      detailProcessId: number;
      enterDate: string;
      examScore: string;
      correctAnswersCount: number;
      resultStatus: "PASSED" | "FAILED";
      certificateNo: string | null;
      effectiveDate: string | null;
      expireDate: string | null;
      certificateStatus: "ACTIVE" | "EXPIRED" | "NOT_ISSUED";
      approvalStatus: "APPROVED" | "WAITING_APPROVAL" | "DRAFT";
      approver: string | null;
      remark: string;
      trainingStart: string;
      trainingEnd: string;
      examDate: string;
    }
  ) => {
    const staff = getStaff(params.eid);
    const examQuestions = getQuestionsForExam(targetExam.id);

    // 1. Create Inspector
    const inspector = inspectorRepo.create({
      eid: params.eid,
      knoxId: params.knoxId,
      nameSnapshot: staff.fullName,
      gbmSnapshot: staff.gbm || null,
      partCodeSnapshot: targetExam.partCode,
      partSnapshot: staff.department,
      productSnapshot: staff.product,
      plantId: plant.id,
      processId: process.id,
      detailProcessId: params.detailProcessId,
      enterDate: params.enterDate,
      isActive: true,
      createdBy: "admin"
    });
    await inspectorRepo.save(inspector);

    // 2. Create Exam Result
    const examResult = examResultRepo.create({
      inspectorId: inspector.id,
      examId: targetExam.id,
      partCodeSnapshot: targetExam.partCode,
      examCodeSnapshot: targetExam.examCode,
      examTitleSnapshot: targetExam.title,
      passingScoreSnapshot: targetExam.passingScore,
      totalQuestionsSnapshot: targetExam.totalQuestions,
      certificateValidMonthsSnapshot: targetExam.certificateValidMonths,
      trainingStartDate: params.trainingStart,
      trainingEndDate: params.trainingEnd,
      examDate: params.examDate,
      correctCount: params.correctAnswersCount,
      wrongCount: targetExam.totalQuestions - params.correctAnswersCount,
      unansweredCount: 0,
      score: params.examScore,
      resultStatus: params.resultStatus,
      startedAt: new Date(`${params.examDate}T08:00:00Z`),
      submittedAt: new Date(`${params.examDate}T08:25:00Z`),
      remark: params.remark,
      createdBy: "admin"
    });
    await examResultRepo.save(examResult);

    // 3. Create Exam Result Answers
    for (let i = 0; i < targetExam.totalQuestions; i++) {
      const q = examQuestions[i];
      const isCorrect = i < params.correctAnswersCount;
      const selected = isCorrect ? q.correctAnswer : (q.correctAnswer === "A" ? "B" : "A");
      
      const ans = answerRepo.create({
        examResultId: examResult.id,
        questionId: q.id,
        questionNoSnapshot: q.questionNo,
        questionTextSnapshot: q.questionText,
        selectedAnswer: selected,
        correctAnswerSnapshot: q.correctAnswer,
        isCorrect: isCorrect,
        scoreEarned: isCorrect ? q.score : "0.00"
      });
      await answerRepo.save(ans);
    }

    // 4. Create Certificate Result if approved/issued or exists
    let certResult: CertificateResult | null = null;
    if (params.approvalStatus === "APPROVED" || params.certificateStatus !== "NOT_ISSUED") {
      certResult = certResultRepo.create({
        inspectorId: inspector.id,
        examResultId: examResult.id,
        certificateNo: params.certificateNo,
        effectiveDate: params.effectiveDate,
        expireDate: params.expireDate,
        certificateValidMonthsSnapshot: targetExam.certificateValidMonths,
        certificateStatus: params.certificateStatus,
        remark: params.remark,
        createdBy: "admin"
      });
      await certResultRepo.save(certResult);
    }

    // 5. Create Approval Request
    if (params.approvalStatus !== "DRAFT") {
      const appReq = approvalRepo.create({
        examResultId: examResult.id,
        certificateResultId: certResult ? certResult.id : null,
        externalApprovalCode: `EXT-APP-${params.eid}`,
        externalApprovalUrl: `http://external-system.local/approval/${params.eid}`,
        approvalStatus: params.approvalStatus,
        requestedBy: "admin",
        requestedAt: new Date(`${params.examDate}T09:00:00Z`),
        approvedBy: params.approver || null,
        approvedAt: params.approvalStatus === "APPROVED" ? new Date(`${params.effectiveDate}T10:00:00Z`) : null
      });
      await approvalRepo.save(appReq);
    }

    // 6. Write Histories
    await historyRepo.save([
      historyRepo.create({
        targetType: "INSPECTOR",
        targetId: inspector.id,
        action: "CREATE_INSPECTOR",
        newValue: { eid: inspector.eid },
        changedBy: "admin"
      }),
      historyRepo.create({
        targetType: "EXAM_RESULT",
        targetId: examResult.id,
        action: "START_EXAM",
        newValue: { status: "NOT_TAKEN" },
        changedBy: "admin"
      }),
      historyRepo.create({
        targetType: "EXAM_RESULT",
        targetId: examResult.id,
        action: "SUBMIT_EXAM",
        newValue: { score: examResult.score, status: examResult.resultStatus },
        changedBy: "admin"
      })
    ]);

    if (params.approvalStatus === "APPROVED") {
      await historyRepo.save([
        historyRepo.create({
          targetType: "APPROVAL_REQUEST",
          targetId: examResult.id,
          action: "APPROVE",
          newValue: { status: "APPROVED", approvedBy: params.approver },
          changedBy: params.approver
        }),
        historyRepo.create({
          targetType: "CERTIFICATE_RESULT",
          targetId: certResult!.id,
          action: "ISSUE_CERTIFICATE",
          newValue: { certificateNo: certResult!.certificateNo, status: certResult!.certificateStatus },
          changedBy: "admin"
        })
      ]);
    }
  };

  // Seed SEHC-001 (An) - ACTIVE Certificate - linked to EXAM 1
  await seedInspectorCertFlow(exam1, {
    eid: "SEHC-001",
    knoxId: "vanan.ng",
    detailProcessId: iqc.id,
    enterDate: "2021-06-08",
    examScore: "100.00",
    correctAnswersCount: 5,
    resultStatus: "PASSED",
    certificateNo: "CERT-2025-0001",
    effectiveDate: "2025-06-09",
    expireDate: "2027-06-09",
    certificateStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    approver: "Tran Ngoc My Trinh",
    remark: "",
    trainingStart: "2025-05-20",
    trainingEnd: "2025-05-28",
    examDate: "2025-06-01"
  });

  // Seed SEHC-014 (Hoa) - EXPIRED Certificate - linked to EXAM 2
  await seedInspectorCertFlow(exam2, {
    eid: "SEHC-014",
    knoxId: "hoa.tt",
    detailProcessId: iqc.id,
    enterDate: "2020-02-19",
    examScore: "100.00",
    correctAnswersCount: 5,
    resultStatus: "PASSED",
    certificateNo: "CERT-2024-0137",
    effectiveDate: "2024-06-25",
    expireDate: "2026-06-20",
    certificateStatus: "EXPIRED",
    approvalStatus: "APPROVED",
    approver: "Tran Ngoc My Trinh",
    remark: "Renewal needed",
    trainingStart: "2024-05-25",
    trainingEnd: "2024-06-05",
    examDate: "2024-06-12"
  });

  // Seed SEHC-017 (Tuan) - WAITING APPROVAL - linked to EXAM 3
  await seedInspectorCertFlow(exam3, {
    eid: "SEHC-017",
    knoxId: "tuan.dm",
    detailProcessId: iqc.id,
    enterDate: "2016-07-18",
    examScore: "100.00",
    correctAnswersCount: 5,
    resultStatus: "PASSED",
    certificateNo: null,
    effectiveDate: null,
    expireDate: null,
    certificateStatus: "NOT_ISSUED",
    approvalStatus: "WAITING_APPROVAL",
    approver: null,
    remark: "Pending external approval",
    trainingStart: "2024-08-10",
    trainingEnd: "2024-08-18",
    examDate: "2024-08-22"
  });

  // Seed SEHC-028 (Minh) - ACTIVE Certificate - linked to EXAM 4
  await seedInspectorCertFlow(exam4, {
    eid: "SEHC-028",
    knoxId: "minh.lq",
    detailProcessId: iqc.id,
    enterDate: "2016-06-13",
    examScore: "100.00",
    correctAnswersCount: 5,
    resultStatus: "PASSED",
    certificateNo: "CERT-2024-0221",
    effectiveDate: "2025-01-19",
    expireDate: "2027-01-19",
    certificateStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    approver: "Nguyen Minh Quan",
    remark: "",
    trainingStart: "2024-08-05",
    trainingEnd: "2024-08-15",
    examDate: "2024-08-20"
  });

  // Seed SEHC-033 (Trang) - FAILED Exam / DRAFT - linked to EXAM 5
  await seedInspectorCertFlow(exam5, {
    eid: "SEHC-033",
    knoxId: "trang.pt",
    detailProcessId: oqcMass.id,
    enterDate: "2017-06-05",
    examScore: "80.00",
    correctAnswersCount: 4,
    resultStatus: "FAILED",
    certificateNo: null,
    effectiveDate: null,
    expireDate: null,
    certificateStatus: "NOT_ISSUED",
    approvalStatus: "DRAFT",
    approver: null,
    remark: "Retake exam required",
    trainingStart: "2026-05-10",
    trainingEnd: "2026-05-18",
    examDate: "2026-05-25"
  });

  await AppDataSource.destroy();
  console.log("Full MCQ data seeding with all 6 exams completed successfully!");
}

main().catch(err => {
  console.error("Error seeding data:", err);
});
