import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";

export function createAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, type: "access" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_TTL, issuer: "dsa-forge-api", audience: "dsa-forge-client" },
  );
}

export function createRefreshToken(user, sessionId) {
  return jwt.sign(
    { sub: user.id, sid: sessionId, type: "refresh", jti: crypto.randomUUID() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d`, issuer: "dsa-forge-api", audience: "dsa-forge-refresh" },
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: "dsa-forge-api", audience: "dsa-forge-client" });
  if (payload.type !== "access") throw new Error("Invalid token type");
  return payload;
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, { issuer: "dsa-forge-api", audience: "dsa-forge-refresh" });
  if (payload.type !== "refresh") throw new Error("Invalid token type");
  return payload;
}

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
