import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default("/api/v1"),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_ACCESS_SECRET: z.string().min(24, "JWT_ACCESS_SECRET must be at least 24 characters"),
  JWT_REFRESH_SECRET: z.string().min(24, "JWT_REFRESH_SECRET must be at least 24 characters"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  COOKIE_SECURE: z.enum(["true", "false"]).default("false").transform(v => v === "true"),
  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),
  COOKIE_DOMAIN: z.string().optional().default(""),
  // NVIDIA OpenAI API
  NVIDIA_API_KEY: z.string().optional().default(""),
  NVIDIA_BASE_URL: z.string().default("https://integrate.api.nvidia.com/v1"),
  NVIDIA_CHAT_MODEL: z.string().default("openai/gpt-oss-20b"),
  // Gemini for embeddings only
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),
  PINECONE_API_KEY: z.string().optional().default(""),
  PINECONE_INDEX_NAME: z.string().optional().default(""),
  PINECONE_NAMESPACE: z.string().optional().default(""),
  PDF_PATH: z.string().default("./files/DSA-revision-guide.pdf"),
  CHUNK_SIZE: z.coerce.number().int().positive().default(1000),
  CHUNK_OVERLAP: z.coerce.number().int().nonnegative().default(150),
  INGEST_BATCH_SIZE: z.coerce.number().int().positive().default(50),
  INGEST_BATCH_DELAY_MS: z.coerce.number().int().nonnegative().default(60000),
  MAX_MESSAGE_LENGTH: z.coerce.number().int().positive().default(8000),
  RETRIEVAL_TOP_K: z.coerce.number().int().positive().default(8),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
