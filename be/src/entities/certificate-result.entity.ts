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
import { CERTIFICATE_STATUSES } from "../constants/inspector-certification";
import { Inspector } from "./inspector.entity";
import { ExamResult } from "./exam-result.entity";
import { ApprovalRequest } from "./approval-request.entity";

@Entity({ name: "certificate_results" })
@Index("uk_certificate_results_exam_result", ["examResultId"], { unique: true })
@Index("idx_certificate_results_inspector", ["inspectorId"])
@Index("idx_certificate_results_certificate_no", ["certificateNo"])
@Index("idx_certificate_results_effective_date", ["effectiveDate"])
@Index("idx_certificate_results_expire_date", ["expireDate"])
@Index("idx_certificate_results_status", ["certificateStatus"])
export class CertificateResult {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: number;

  @Column({ name: "inspector_id", type: "bigint", unsigned: true })
  inspectorId!: number;

  @Column({ name: "exam_result_id", type: "bigint", unsigned: true })
  examResultId!: number;

  @Column({ name: "certificate_no", type: "varchar", length: 100, nullable: true })
  certificateNo!: string | null;

  @Column({ name: "effective_date", type: "date", nullable: true })
  effectiveDate!: string | null;

  @Column({ name: "expire_date", type: "date", nullable: true })
  expireDate!: string | null;

  @Column({ name: "certificate_valid_months_snapshot", type: "int", nullable: true })
  certificateValidMonthsSnapshot!: number | null;

  @Column({ name: "certificate_status", type: "enum", enum: CERTIFICATE_STATUSES, default: "NOT_ISSUED" })
  certificateStatus!: (typeof CERTIFICATE_STATUSES)[number];

  @Column({ type: "text", nullable: true })
  remark!: string | null;

  @Column({ name: "created_by", type: "varchar", length: 100, nullable: true })
  createdBy!: string | null;

  @ManyToOne(() => Inspector, (inspector) => inspector.certificateResults, { onDelete: "CASCADE" })
  @JoinColumn({ name: "inspector_id" })
  inspector!: Inspector;

  @ManyToOne(() => ExamResult, (result) => result.certificateResults, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "exam_result_id" })
  examResult!: ExamResult;

  @OneToMany(() => ApprovalRequest, (request) => request.certificateResult)
  approvalRequests!: ApprovalRequest[];

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", nullable: true })
  updatedAt!: Date | null;
}
