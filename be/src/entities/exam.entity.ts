import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { EXAM_STATUSES } from "../constants/inspector-certification";
import { ExamQuestion } from "./exam-question.entity";
import { ExamResult } from "./exam-result.entity";

@Entity({ name: "exams" })
@Index("uk_exams_exam_code", ["examCode"], { unique: true })
@Index("uk_exams_part_version", ["partCode", "versionNo"], { unique: true })
@Index("idx_exams_part_code", ["partCode"])
@Index("idx_exams_status", ["status"])
@Index("idx_exams_part_status", ["partCode", "status"])
export class Exam {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: number;

  @Column({ name: "part_code", type: "varchar", length: 50 })
  partCode!: string;

  @Column({ name: "exam_code", type: "varchar", length: 100 })
  examCode!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "duration_minutes", type: "int" })
  durationMinutes!: number;

  @Column({ name: "passing_score", type: "decimal", precision: 5, scale: 2 })
  passingScore!: string;

  @Column({ name: "total_questions", type: "int", default: 0 })
  totalQuestions!: number;

  @Column({ name: "certificate_valid_months", type: "int", default: 24 })
  certificateValidMonths!: number;

  @Column({ type: "enum", enum: EXAM_STATUSES, default: "DRAFT" })
  status!: (typeof EXAM_STATUSES)[number];

  @Column({ name: "version_no", type: "int", default: 1 })
  versionNo!: number;

  @Column({ name: "created_by", type: "varchar", length: 100, nullable: true })
  createdBy!: string | null;

  @Column({ name: "published_by", type: "varchar", length: 100, nullable: true })
  publishedBy!: string | null;

  @Column({ name: "published_at", type: "datetime", nullable: true })
  publishedAt!: Date | null;

  @Column({ name: "archived_by", type: "varchar", length: 100, nullable: true })
  archivedBy!: string | null;

  @Column({ name: "archived_at", type: "datetime", nullable: true })
  archivedAt!: Date | null;

  @OneToMany(() => ExamQuestion, (question) => question.exam)
  questions!: ExamQuestion[];

  @OneToMany(() => ExamResult, (result) => result.exam)
  examResults!: ExamResult[];

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", nullable: true })
  updatedAt!: Date | null;
}
