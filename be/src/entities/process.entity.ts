import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DetailProcess } from "./detail-process.entity";
import { Inspector } from "./inspector.entity";

@Entity({ name: "processes" })
@Index("uk_processes_code", ["code"], { unique: true })
@Index("idx_processes_active", ["isActive"])
export class InspectionProcess {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: number;

  @Column({ type: "varchar", length: 50 })
  code!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => DetailProcess, (detailProcess) => detailProcess.process)
  detailProcesses!: DetailProcess[];

  @OneToMany(() => Inspector, (inspector) => inspector.process)
  inspectors!: Inspector[];

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", nullable: true })
  updatedAt!: Date | null;
}
