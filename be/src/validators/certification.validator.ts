import { z } from "zod";

export const createCertificationSchema = z.object({
  inspectorEid: z.string().trim().min(1).max(50),
  examCode: z.string().trim().min(1).max(100),
  trainingStartDate: z.string().date(),
  trainingEndDate: z.string().date(),
  examDate: z.string().date(),
  examScore: z.coerce.number().min(0).max(1000),
  approvalStatus: z
    .enum(["DRAFT", "WAITING_APPROVAL", "APPROVED", "REJECTED", "CANCELLED"])
    .default("DRAFT"),
  certificateNo: z.string().trim().max(100).optional().or(z.literal("")),
  certificateDate: z.string().date().optional().or(z.literal("")),
  expireDate: z.string().date().optional().or(z.literal("")),
  approver: z.string().trim().max(100).optional().or(z.literal("")),
  remark: z.string().trim().max(2000).optional().or(z.literal("")),
  certificateFileName: z.string().trim().max(255).optional().or(z.literal(""))
});

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
