import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.string().default("4000"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  FLIGHT_API_KEY: z.string().optional(),
  HOTEL_API_KEY: z.string().optional(),
  EVENTS_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", parsed.error.format());
  throw new Error("Invalid environment configuration");
}

export const env = {
  ...parsed.data,
  port: Number(parsed.data.PORT) || 4000,
  isProduction: parsed.data.NODE_ENV === "production",
};
