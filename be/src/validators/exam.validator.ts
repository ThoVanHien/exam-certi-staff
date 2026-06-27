import { z } from "zod";

export const submitExamSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.number().int().positive(),
        answer: z.string().min(1)
      })
    )
    .min(1)
});
