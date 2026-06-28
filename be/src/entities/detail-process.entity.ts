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
import { InspectionProcess } from "./process.entity";
import { Inspector } from "./inspector.entity";

@Entity({ name: "detail_processes" })
@Index("uk_detail_processes_process_code", ["processId", "code"], { unique: true })
@Index("idx_detail_processes_process", ["processId"])
@Index("idx_detail_processes_active", ["isActive"])
export class DetailProcess {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: number;

  @Column({ name: "process_id", type: "bigint", unsigned: true })
  processId!: number;

  @Column({ type: "varchar", length: 50 })
  code!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @ManyToOne(() => InspectionProcess, (process) => process.detailProcesses, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "process_id" })
  process!: InspectionProcess;

  @OneToMany(() => Inspector, (inspector) => inspector.detailProcess)
  inspectors!: Inspector[];

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", nullable: true })
  updatedAt!: Date | null;
}
