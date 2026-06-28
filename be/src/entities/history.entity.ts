import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";
import { HISTORY_TARGET_TYPES, HISTORY_ACTIONS } from "../constants/inspector-certification";

@Entity({ name: "histories" })
@Index("idx_histories_target", ["targetType", "targetId"])
@Index("idx_histories_action", ["action"])
@Index("idx_histories_changed_at", ["changedAt"])
export class History {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: number;

  @Column({ name: "target_type", type: "enum", enum: HISTORY_TARGET_TYPES })
  targetType!: (typeof HISTORY_TARGET_TYPES)[number];

  @Column({ name: "target_id", type: "bigint", unsigned: true })
  targetId!: number;

  @Column({ type: "enum", enum: HISTORY_ACTIONS })
  action!: (typeof HISTORY_ACTIONS)[number];

  @Column({ name: "old_value", type: "json", nullable: true })
  oldValue!: Record<string, unknown> | null;

  @Column({ name: "new_value", type: "json", nullable: true })
  newValue!: Record<string, unknown> | null;

  @Column({ name: "changed_by", type: "varchar", length: 100, nullable: true })
  changedBy!: string | null;

  @CreateDateColumn({ name: "changed_at", type: "datetime" })
  changedAt!: Date;
}
