import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { ExamQuestion } from "./exam-question.entity";
import { ExamResult } from "./exam-result.entity";
import { User } from "./user.entity";

@Entity({ name: "exams" })
export class Exam {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "int", comment: "Thoi gian lam bai tinh theo phut" })
  duration!: number;

  @Column({ name: "total_questions", type: "int", default: 0 })
  totalQuestions!: number;

  @Column({ name: "created_by_user_id", type: "int", nullable: true })
  createdByUserId!: number | null;

  @Column({ type: "varchar", length: 100, nullable: true, default: "Production" })
  department!: string | null;

  @OneToMany(() => ExamQuestion, (question) => question.exam)
  questions!: ExamQuestion[];

  @OneToMany(() => ExamResult, (examResult) => examResult.exam)
  examResults!: ExamResult[];

  @ManyToOne(() => User, (user) => user.createdExams, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "created_by_user_id" })
  createdByUser!: User | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
