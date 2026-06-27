import { z } from "zod";

export const uploadCertificateSchema = z.object({
  userId: z.coerce.number().int().positive(),
  title: z.string().min(1).max(255),
  issueDate: z.string().date(),
  expiryDate: z.string().date().optional().or(z.literal(""))
});
