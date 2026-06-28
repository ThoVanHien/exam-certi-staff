export const ExamStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED"
} as const;

export const AnswerChoice = {
  A: "A",
  B: "B",
  C: "C",
  D: "D"
} as const;

export const ExamResultStatus = {
  NOT_TAKEN: "NOT_TAKEN",
  PASSED: "PASSED",
  FAILED: "FAILED"
} as const;

export const ApprovalStatus = {
  DRAFT: "DRAFT",
  WAITING_APPROVAL: "WAITING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED"
} as const;

export const CertificateStatus = {
  NOT_ISSUED: "NOT_ISSUED",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  REVOKED: "REVOKED"
} as const;

export const HistoryTargetType = {
  INSPECTOR: "INSPECTOR",
  EXAM: "EXAM",
  EXAM_QUESTION: "EXAM_QUESTION",
  EXAM_RESULT: "EXAM_RESULT",
  EXAM_RESULT_ANSWER: "EXAM_RESULT_ANSWER",
  APPROVAL_REQUEST: "APPROVAL_REQUEST",
  CERTIFICATE_RESULT: "CERTIFICATE_RESULT"
} as const;
