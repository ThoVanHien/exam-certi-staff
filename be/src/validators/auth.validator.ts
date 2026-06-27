import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  // O buoc login chi can password khong rong; do manh yeu xu ly o buoc tao/doi mat khau.
  password: z.string().min(1).max(100)
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(20)
});
