import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  UPLOADS_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().default('10485760'), // 10MB in bytes
  TIMEZONE: z.string().optional(),
  SMS_ENABLED: z.string().optional(),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error('Invalid environment variables:', envVars.error.format());
  process.exit(1);
}

export const env = envVars.data;

