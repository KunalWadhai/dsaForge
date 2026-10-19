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

export const app = express();
app.disable("x-powered-by");
app.set("trust proxy", isProduction ? 1 : false);
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_ORIGIN,
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
