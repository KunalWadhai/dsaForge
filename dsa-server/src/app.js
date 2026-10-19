import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env, isProduction } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import ingestionRoutes from "./modules/ingestion/ingestion.routes.js";
import { HttpError } from "./utils/httpError.js";

/**
 * Build the CORS origin resolver.
 *
 * - In development: any localhost / 127.0.0.1 origin is allowed
 *   automatically so you never need to update the env var just to change
 *   the Next.js port.
 * - In all envs: origins listed in FRONTEND_ORIGIN (comma-separated) are
 *   allowed.
 * - Any other origin is rejected with a CORS error.
 */
function buildCorsOrigin() {
  const allowed = Array.isArray(env.FRONTEND_ORIGIN)
    ? env.FRONTEND_ORIGIN
    : [env.FRONTEND_ORIGIN];

  const localhostRe = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

  return function corsOriginFn(origin, callback) {
    // Non-browser requests (curl, Postman, server-to-server) have no Origin.
    if (!origin) return callback(null, true);

    // Always allow localhost in dev — avoids env-var friction during local work.
    if (!isProduction && localhostRe.test(origin)) {
      return callback(null, true);
    }

    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin '${origin}' not allowed`));
  };
}

export const app = express();
app.disable("x-powered-by");
app.set("trust proxy", isProduction ? 1 : false);
app.use(helmet());
app.use(cors({
  origin: buildCorsOrigin(),
  credentials: true,
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());
app.use(rateLimit({ 
  windowMs: 60 * 1000,
  limit: 120, standardHeaders: "draft-7",
  legacyHeaders: false 
}));

app.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok", service: "dsa-forge-api" } }));

const prefix = env.API_PREFIX;
app.use(`${prefix}/auth`, authRoutes);
app.use(`${prefix}`, chatRoutes);
app.use(`${prefix}/ingestion`, ingestionRoutes);

app.use((_req, _res, next) => next(new HttpError(404, "Route not found")));

app.use((err, _req, res, _next) => {
  const status = Number.isInteger(err.status) ? err.status : 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    message: status >= 500 && isProduction ? "Internal server error" : (err.message || "Internal server error"),
    ...(err.details && status < 500 ? { details: err.details } : {}),
  });
});
