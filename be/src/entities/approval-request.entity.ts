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
import { APPROVAL_STATUSES } from "../constants/inspector-certification";
import { ExamResult } from "./exam-result.entity";
import { CertificateResult } from "./certificate-result.entity";

@Entity({ name: "approval_requests" })
@Index("idx_approval_requests_exam_result", ["examResultId"])
@Index("idx_approval_requests_certificate_result", ["certificateResultId"])
@Index("idx_approval_requests_external_code", ["externalApprovalCode"])
@Index("idx_approval_requests_status", ["approvalStatus"])
export class ApprovalRequest {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: number;

  @Column({ name: "exam_result_id", type: "bigint", unsigned: true })
  examResultId!: number;

  @Column({ name: "certificate_result_id", type: "bigint", unsigned: true, nullable: true })
  certificateResultId!: number | null;

  @Column({ name: "external_approval_code", type: "varchar", length: 100, nullable: true })
  externalApprovalCode!: string | null;

  @Column({ name: "external_approval_url", type: "varchar", length: 1000, nullable: true })
  externalApprovalUrl!: string | null;

  @Column({ name: "approval_status", type: "enum", enum: APPROVAL_STATUSES, default: "WAITING_APPROVAL" })
  approvalStatus!: (typeof APPROVAL_STATUSES)[number];

  @Column({ name: "requested_by", type: "varchar", length: 100, nullable: true })
  requestedBy!: string | null;

  @Column({ name: "requested_at", type: "datetime", nullable: true })
  requestedAt!: Date | null;

  @Column({ name: "approved_by", type: "varchar", length: 100, nullable: true })
  approvedBy!: string | null;

  @Column({ name: "approved_at", type: "datetime", nullable: true })
  approvedAt!: Date | null;

  @Column({ name: "rejected_by", type: "varchar", length: 100, nullable: true })
  rejectedBy!: string | null;

  @Column({ name: "rejected_at", type: "datetime", nullable: true })
  rejectedAt!: Date | null;

  @Column({ name: "reject_reason", type: "text", nullable: true })
  rejectReason!: string | null;

  @Column({ name: "cancelled_by", type: "varchar", length: 100, nullable: true })
  cancelledBy!: string | null;

  @Column({ name: "cancelled_at", type: "datetime", nullable: true })
  cancelledAt!: Date | null;

  @ManyToOne(() => ExamResult, (result) => result.approvalRequests, { onDelete: "CASCADE" })
  @JoinColumn({ name: "exam_result_id" })
  examResult!: ExamResult;

  @ManyToOne(() => CertificateResult, (result) => result.approvalRequests, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "certificate_result_id" })
  certificateResult!: CertificateResult | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", nullable: true })
  updatedAt!: Date | null;
}
