import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: parseInt(getEnv("PORT", "5000"), 10),

  DB_HOST: getEnv("DB_HOST", "localhost"),
  DB_PORT: parseInt(getEnv("DB_PORT", "5432"), 10),
  DB_NAME: getEnv("DB_NAME", "attendance_db"),
  DB_USER: getEnv("DB_USER", "postgres"),
  DB_PASSWORD: getEnv("DB_PASSWORD", "postgres"),

  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "8h"),

  CORS_ORIGIN: getEnv("CORS_ORIGIN", "http://localhost:5173"),

  RATE_LIMIT_WINDOW_MS: parseInt(getEnv("RATE_LIMIT_WINDOW_MS", "900000"), 10),
  RATE_LIMIT_MAX: parseInt(getEnv("RATE_LIMIT_MAX", "100"), 10),
} as const;
