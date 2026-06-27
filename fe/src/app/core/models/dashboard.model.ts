export type DashboardSection = 'employees' | 'examinations' | 'certificates' | 'results';

export interface EmployeeItem {
  id: string;
  name: string;
  department: string;
  certification: string;
  examStatus: string;
  expiry: string;
}

export interface NavItem {
  key: DashboardSection;
  label: string;
  hint: string;
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
