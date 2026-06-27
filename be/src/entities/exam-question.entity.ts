import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Exam } from "./exam.entity";

@Entity({ name: "exam_questions" })
export class ExamQuestion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "exam_id", type: "int" })
  examId!: number;

  @Column({ type: "text" })
  question!: string;

  @Column({ type: "json", nullable: true, comment: "Danh sach dap an goi y cho UI" })
  options!: string[] | null;

  @Column({ name: "correct_answer", type: "varchar", length: 255 })
  correctAnswer!: string;

  @Column({ name: "order_no", type: "int", default: 1 })
  orderNo!: number;

  @ManyToOne(() => Exam, (exam) => exam.questions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "exam_id" })
  exam!: Exam;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
