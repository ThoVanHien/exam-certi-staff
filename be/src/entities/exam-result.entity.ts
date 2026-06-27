import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { User } from "./user.entity";
import { Exam } from "./exam.entity";
import { EXAM_RESULT_STATUS } from "../constants/common";

@Entity({ name: "exam_results" })
export class ExamResult {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "user_id", type: "int" })
  userId!: number;

  @Column({ name: "exam_id", type: "int" })
  examId!: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  score!: string;

  @Column({ type: "enum", enum: EXAM_RESULT_STATUS })
  status!: (typeof EXAM_RESULT_STATUS)[number];

  @Column({ name: "correct_answers", type: "int", default: 0 })
  correctAnswers!: number;

  @Column({ name: "answered_questions", type: "int", default: 0 })
  answeredQuestions!: number;

  @Column({ name: "completed_at", type: "datetime" })
  completedAt!: Date;

  @ManyToOne(() => User, (user) => user.examResults, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Exam, (exam) => exam.examResults, { onDelete: "CASCADE" })
  @JoinColumn({ name: "exam_id" })
  exam!: Exam;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
