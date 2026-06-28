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
import { ANSWER_CHOICES } from "../constants/inspector-certification";
import { Exam } from "./exam.entity";
import { ExamResultAnswer } from "./exam-result-answer.entity";

@Entity({ name: "exam_questions" })
@Index("uk_exam_questions_exam_question_no", ["examId", "questionNo"], { unique: true })
@Index("idx_exam_questions_exam", ["examId"])
@Index("idx_exam_questions_active", ["isActive"])
export class ExamQuestion {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: number;

  @Column({ name: "exam_id", type: "bigint", unsigned: true })
  examId!: number;

  @Column({ name: "question_no", type: "int" })
  questionNo!: number;

  @Column({ name: "question_text", type: "text" })
  questionText!: string;

  @Column({ name: "option_a", type: "text" })
  optionA!: string;

  @Column({ name: "option_b", type: "text" })
  optionB!: string;

  @Column({ name: "option_c", type: "text" })
  optionC!: string;

  @Column({ name: "option_d", type: "text" })
  optionD!: string;

  @Column({ name: "correct_answer", type: "enum", enum: ANSWER_CHOICES })
  correctAnswer!: (typeof ANSWER_CHOICES)[number];

  @Column({ type: "decimal", precision: 5, scale: 2, default: "1.00" })
  score!: string;

  @Column({ type: "text", nullable: true })
  explanation!: string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @ManyToOne(() => Exam, (exam) => exam.questions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "exam_id" })
  exam!: Exam;

  @OneToMany(() => ExamResultAnswer, (answer) => answer.question)
  answers!: ExamResultAnswer[];

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", nullable: true })
  updatedAt!: Date | null;
}
