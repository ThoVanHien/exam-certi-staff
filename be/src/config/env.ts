import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_NAME: z.string().default("ECEP Backend"),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_SOCKET_PATH: z.string().optional(),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_SYNC: z.coerce.boolean().default(false),
  DB_LOGGING: z.coerce.boolean().default(false),
  CERT_STORAGE_PATH: z.string().min(1),
  MAX_FILE_SIZE: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("120m"),
  JWT_REFRESH_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

export const env = {
  ...parsedEnv.data,
  DB_SOCKET_PATH: parsedEnv.data.DB_SOCKET_PATH?.trim() || undefined,
  CERT_STORAGE_PATH: path.resolve(parsedEnv.data.CERT_STORAGE_PATH)
};
