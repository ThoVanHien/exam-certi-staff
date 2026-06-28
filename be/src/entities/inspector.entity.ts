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
import { Plant } from "./plant.entity";
import { InspectionProcess } from "./process.entity";
import { DetailProcess } from "./detail-process.entity";
import { ExamResult } from "./exam-result.entity";
import { CertificateResult } from "./certificate-result.entity";

@Entity({ name: "inspectors" })
@Index("uk_inspectors_eid_detail_process", ["eid", "detailProcessId"], { unique: true })
@Index("idx_inspectors_eid", ["eid"])
@Index("idx_inspectors_knox_id", ["knoxId"])
@Index("idx_inspectors_part_code_snapshot", ["partCodeSnapshot"])
@Index("idx_inspectors_active", ["isActive"])
@Index("idx_inspectors_plant", ["plantId"])
@Index("idx_inspectors_process", ["processId"])
@Index("idx_inspectors_detail_process", ["detailProcessId"])
export class Inspector {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: number;

  @Column({ type: "varchar", length: 50 })
  eid!: string;

  @Column({ name: "knox_id", type: "varchar", length: 100, nullable: true })
  knoxId!: string | null;

  @Column({ name: "name_snapshot", type: "varchar", length: 255, nullable: true })
  nameSnapshot!: string | null;

  @Column({ name: "gbm_snapshot", type: "varchar", length: 255, nullable: true })
  gbmSnapshot!: string | null;

  @Column({ name: "part_code_snapshot", type: "varchar", length: 50, nullable: true })
  partCodeSnapshot!: string | null;

  @Column({ name: "part_snapshot", type: "varchar", length: 255, nullable: true })
  partSnapshot!: string | null;

  @Column({ name: "product_snapshot", type: "varchar", length: 255, nullable: true })
  productSnapshot!: string | null;

  @Column({ name: "plant_id", type: "bigint", unsigned: true })
  plantId!: number;

  @Column({ name: "process_id", type: "bigint", unsigned: true })
  processId!: number;

  @Column({ name: "detail_process_id", type: "bigint", unsigned: true })
  detailProcessId!: number;

  @Column({ name: "enter_date", type: "date", nullable: true })
  enterDate!: string | null;

  @Column({ name: "remark", type: "text", nullable: true })
  remark!: string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "created_by", type: "varchar", length: 100, nullable: true })
  createdBy!: string | null;

  @ManyToOne(() => Plant, (plant) => plant.inspectors, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "plant_id" })
  plant!: Plant;

  @ManyToOne(() => InspectionProcess, (process) => process.inspectors, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "process_id" })
  process!: InspectionProcess;

  @ManyToOne(() => DetailProcess, (detailProcess) => detailProcess.inspectors, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "detail_process_id" })
  detailProcess!: DetailProcess;

  @OneToMany(() => ExamResult, (result) => result.inspector)
  examResults!: ExamResult[];

  @OneToMany(() => CertificateResult, (result) => result.inspector)
  certificateResults!: CertificateResult[];

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", nullable: true })
  updatedAt!: Date | null;
}
