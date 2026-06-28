export type DashboardSection = 'employees' | 'examinations' | 'certificates' | 'results' | 'take-exam';

export interface CertificationEntry {
  examCode: string;
  trainingStartDate: string;
  trainingEndDate: string;
  examDate: string;
  examScore: number | null;
  passingScore: number;
  approvalStatus: 'DRAFT' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  certificateNo: string;
  certificateDate: string;
  expireDate: string;
  approver: string;
  certificateFileName?: string;
}

export interface CreateCertificationPayload {
  inspectorEid: string;
  examCode: string;
  trainingStartDate: string;
  trainingEndDate: string;
  examDate: string;
  examScore: number;
  approvalStatus: 'DRAFT' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  certificateNo: string;
  certificateDate: string;
  expireDate: string;
  approver: string;
  remark?: string;
  certificateFileName?: string;
}

export interface EmployeeItem {
  id: string;
  knoxId: string;
  name: string;
  department: string;
  team: string;
  plant: string;
  product: string;
  enterDate: string;
  process: string;
  detailProcess: string;
  examCode: string;
  trainingStartDate: string;
  trainingEndDate: string;
  examDate: string;
  examScore: number | null;
  passingScore: number;
  examResultStatus: 'NOT_TAKEN' | 'PASSED' | 'FAILED';
  approvalStatus: 'DRAFT' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  certificateNo: string;
  certificateDate: string;
  expireDate: string;
  certificateStatus: 'NOT_ISSUED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  approver: string;
  remark: string;
  certifications: CertificationEntry[];
}

export interface NavItem {
  key: DashboardSection;
  label: string;
  icon: 'employees' | 'exams' | 'certificates' | 'results';
  active?: boolean;
}

export interface ExamItem {
  id: number;
  code: string;
  title: string;
  description: string;
  department: string;
  createdBy: string;
  questionCount: number;
  durationMinutes: number;
  status: 'Published' | 'Draft' | 'Archived';
}
