import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Inspector } from "./inspector.entity";

@Entity({ name: "plants" })
@Index("uk_plants_code", ["code"], { unique: true })
@Index("idx_plants_active", ["isActive"])
export class Plant {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: number;

  @Column({ type: "varchar", length: 50 })
  code!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => Inspector, (inspector) => inspector.plant)
  inspectors!: Inspector[];

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", nullable: true })
  updatedAt!: Date | null;
}
