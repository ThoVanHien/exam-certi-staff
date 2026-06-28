import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * Read-only entity mapping to the existing HR table `staffs_new`.
 * Do NOT add CreateDateColumn/UpdateDateColumn or write operations.
 */
@Entity({ name: "staffs_new" })
export class StaffNew {
  @PrimaryColumn({ name: "EID", type: "varchar", length: 50 })
  eid!: string;

  @Column({ name: "KNOX_ID", type: "varchar", length: 150, nullable: true })
  knoxId!: string | null;

  @Column({ name: "FULL_NAME", type: "varchar", length: 255, nullable: true })
  fullName!: string | null;

  @Column({ name: "EMAIL", type: "varchar", length: 255, nullable: true })
  email!: string | null;

  @Column({ name: "GBM", type: "varchar", length: 255, nullable: true })
  gbm!: string | null;

  @Column({ name: "DEPARTMENT", type: "varchar", length: 255, nullable: true })
  department!: string | null;

  @Column({ name: "TEAM", type: "varchar", length: 255, nullable: true })
  team!: string | null;

  @Column({ name: "PRODUCT", type: "varchar", length: 255, nullable: true })
  product!: string | null;

  @Column({ name: "POSITION", type: "varchar", length: 255, nullable: true })
  position!: string | null;

  @Column({ name: "STATUS", type: "varchar", length: 50, nullable: true })
  status!: string | null;
}
