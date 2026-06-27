import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Certificate } from "./certificate.entity";
import { ExamResult } from "./exam-result.entity";
import { USER_ROLES } from "../constants/common";
import { UserSession } from "./user-session.entity";
import { Exam } from "./exam.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "varchar", length: 150, unique: true })
  email!: string;

  @Column({ type: "enum", enum: USER_ROLES, default: "employee" })
  role!: (typeof USER_ROLES)[number];

  @Column({ type: "varchar", length: 100 })
  department!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => Certificate, (certificate) => certificate.user)
  certificates!: Certificate[];

  @OneToMany(() => ExamResult, (examResult) => examResult.user)
  examResults!: ExamResult[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions!: UserSession[];

  @OneToMany(() => Exam, (exam) => exam.createdByUser)
  createdExams!: Exam[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
