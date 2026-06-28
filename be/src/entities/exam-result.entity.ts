import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { EXAM_RESULT_STATUSES } from "../constants/inspector-certification";
import { Inspector } from "./inspector.entity";
import { Exam } from "./exam.entity";
import { ExamResultAnswer } from "./exam-result-answer.entity";
import { ApprovalRequest } from "./approval-request.entity";
import { CertificateResult } from "./certificate-result.entity";

@Entity({ name: "exam_results" })
@Index("idx_exam_results_inspector", ["inspectorId"])
@Index("idx_exam_results_exam", ["examId"])
@Index("idx_exam_results_part_code_snapshot", ["partCodeSnapshot"])
@Index("idx_exam_results_exam_date", ["examDate"])
@Index("idx_exam_results_result_status", ["resultStatus"])
@Index("idx_exam_results_submitted_at", ["submittedAt"])
export class ExamResult {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: number;

  @Column({ name: "inspector_id", type: "bigint", unsigned: true })
  inspectorId!: number;

  @Column({ name: "exam_id", type: "bigint", unsigned: true })
  examId!: number;

  @Column({ name: "part_code_snapshot", type: "varchar", length: 50, nullable: true })
  partCodeSnapshot!: string | null;

  @Column({ name: "exam_code_snapshot", type: "varchar", length: 100, nullable: true })
  examCodeSnapshot!: string | null;

  @Column({ name: "exam_title_snapshot", type: "varchar", length: 255, nullable: true })
  examTitleSnapshot!: string | null;

  @Column({ name: "passing_score_snapshot", type: "decimal", precision: 5, scale: 2, nullable: true })
  passingScoreSnapshot!: string | null;

  @Column({ name: "total_questions_snapshot", type: "int", nullable: true })
  totalQuestionsSnapshot!: number | null;

  @Column({ name: "certificate_valid_months_snapshot", type: "int", nullable: true })
  certificateValidMonthsSnapshot!: number | null;

  @Column({ name: "training_start_date", type: "date", nullable: true })
  trainingStartDate!: string | null;

  @Column({ name: "training_end_date", type: "date", nullable: true })
  trainingEndDate!: string | null;

  @Column({ name: "exam_date", type: "date", nullable: true })
  examDate!: string | null;

  @Column({ name: "correct_count", type: "int", default: 0 })
  correctCount!: number;

  @Column({ name: "wrong_count", type: "int", default: 0 })
  wrongCount!: number;

  @Column({ name: "unanswered_count", type: "int", default: 0 })
  unansweredCount!: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  score!: string | null;

  @Column({ name: "result_status", type: "enum", enum: EXAM_RESULT_STATUSES, default: "NOT_TAKEN" })
  resultStatus!: (typeof EXAM_RESULT_STATUSES)[number];

  @Column({ name: "started_at", type: "datetime", nullable: true })
  startedAt!: Date | null;

  @Column({ name: "submitted_at", type: "datetime", nullable: true })
  submittedAt!: Date | null;

  @Column({ type: "text", nullable: true })
  remark!: string | null;

  @Column({ name: "created_by", type: "varchar", length: 100, nullable: true })
  createdBy!: string | null;

  @ManyToOne(() => Inspector, (inspector) => inspector.examResults, { onDelete: "CASCADE" })
  @JoinColumn({ name: "inspector_id" })
  inspector!: Inspector;

  @ManyToOne(() => Exam, (exam) => exam.examResults, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "exam_id" })
  exam!: Exam;

  @OneToMany(() => ExamResultAnswer, (answer) => answer.examResult)
  answers!: ExamResultAnswer[];

  @OneToMany(() => ApprovalRequest, (request) => request.examResult)
  approvalRequests!: ApprovalRequest[];

  @OneToMany(() => CertificateResult, (cert) => cert.examResult)
  certificateResults!: CertificateResult[];

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", nullable: true })
  updatedAt!: Date | null;
}
