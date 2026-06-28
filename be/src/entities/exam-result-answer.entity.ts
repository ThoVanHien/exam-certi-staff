import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { ANSWER_CHOICES } from "../constants/inspector-certification";
import { ExamResult } from "./exam-result.entity";
import { ExamQuestion } from "./exam-question.entity";

@Entity({ name: "exam_result_answers" })
@Index("uk_exam_result_answers_result_question", ["examResultId", "questionId"], { unique: true })
@Index("idx_exam_result_answers_exam_result", ["examResultId"])
@Index("idx_exam_result_answers_question", ["questionId"])
@Index("idx_exam_result_answers_is_correct", ["isCorrect"])
export class ExamResultAnswer {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: number;

  @Column({ name: "exam_result_id", type: "bigint", unsigned: true })
  examResultId!: number;

  @Column({ name: "question_id", type: "bigint", unsigned: true })
  questionId!: number;

  @Column({ name: "question_no_snapshot", type: "int", nullable: true })
  questionNoSnapshot!: number | null;

  @Column({ name: "question_text_snapshot", type: "text", nullable: true })
  questionTextSnapshot!: string | null;

  @Column({ name: "selected_answer", type: "enum", enum: ANSWER_CHOICES, nullable: true })
  selectedAnswer!: (typeof ANSWER_CHOICES)[number] | null;

  @Column({ name: "correct_answer_snapshot", type: "enum", enum: ANSWER_CHOICES })
  correctAnswerSnapshot!: (typeof ANSWER_CHOICES)[number];

  @Column({ name: "is_correct", type: "boolean", default: false })
  isCorrect!: boolean;

  @Column({ name: "score_earned", type: "decimal", precision: 5, scale: 2, default: "0.00" })
  scoreEarned!: string;

  @ManyToOne(() => ExamResult, (result) => result.answers, { onDelete: "CASCADE" })
  @JoinColumn({ name: "exam_result_id" })
  examResult!: ExamResult;

  @ManyToOne(() => ExamQuestion, (question) => question.answers, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "question_id" })
  question!: ExamQuestion;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", nullable: true })
  updatedAt!: Date | null;
}
