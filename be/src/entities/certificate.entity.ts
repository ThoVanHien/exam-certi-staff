import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "./user.entity";

@Entity({ name: "certificates" })
export class Certificate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "user_id", type: "int" })
  userId!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ name: "issue_date", type: "date" })
  issueDate!: string;

  @Column({ name: "expiry_date", type: "date", nullable: true })
  expiryDate!: string | null;

  @Column({ name: "file_path", type: "varchar", length: 500 })
  filePath!: string;

  @ManyToOne(() => User, (user) => user.certificates, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
