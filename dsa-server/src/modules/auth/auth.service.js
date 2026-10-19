import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { User } from "./user.model.js";
import { Session } from "./session.model.js";
import { env } from "../../config/env.js";
import { createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } from "../../utils/tokens.js";
import { HttpError } from "../../utils/httpError.js";

const publicUser = user => ({ id: String(user._id), name: user.name, email: user.email });

export async function register({ name, email, password }, requestMeta) {
  const normalizedEmail = email.toLowerCase().trim();
  if (await User.exists({ email: normalizedEmail })) throw new HttpError(409, "An account with this email already exists");
  const passwordHash = await bcrypt.hash(password, 12);
  let user;
  try {
    user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });
  } catch (error) {
    if (error?.code === 11000) throw new HttpError(409, "An account with this email already exists");
    throw error;
  }
  return issueSession(user, requestMeta);
}

export async function login({ email, password }, requestMeta) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
  const valid = user && user.isActive && await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new HttpError(401, "Invalid email or password");
  return issueSession(user, requestMeta);
}

async function issueSession(user, requestMeta) {
  const sessionId = randomUUID();
  const refreshToken = createRefreshToken(user, sessionId);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400000);
  await Session.create({
    _id: sessionId, userId: user._id, refreshTokenHash: hashToken(refreshToken), expiresAt,
    userAgent: requestMeta.userAgent, ipAddress: requestMeta.ipAddress,
  });
  return { user: publicUser(user), accessToken: createAccessToken(user), refreshToken };
}

export async function refreshSession(refreshToken) {
  if (!refreshToken) throw new HttpError(401, "Refresh session is missing");
  let payload;
  try { payload = verifyRefreshToken(refreshToken); }
  catch { throw new HttpError(401, "Refresh session is invalid or expired"); }

  const session = await Session.findById(payload.sid).select("+refreshTokenHash");
  if (!session || session.revokedAt || session.expiresAt <= new Date() ||
      session.userId.toString() !== payload.sub || session.refreshTokenHash !== hashToken(refreshToken)) {
    if (session && !session.revokedAt) {
      session.revokedAt = new Date();
      await session.save();
    }
    throw new HttpError(401, "Refresh session is invalid or expired");
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    session.revokedAt = new Date(); await session.save();
    throw new HttpError(401, "Account is unavailable");
  }

  const nextRefreshToken = createRefreshToken(user, String(session._id));
  session.refreshTokenHash = hashToken(nextRefreshToken);
  session.expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400000);
  await session.save();

  return { user: publicUser(user), accessToken: createAccessToken(user), refreshToken: nextRefreshToken };
}

export async function logout(refreshToken) {
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    const session = await Session.findById(payload.sid);
    if (session && !session.revokedAt) {
      session.revokedAt = new Date();
      await session.save();
    }
  } catch {
    // Logout should be idempotent; cookie is cleared even if token has expired.
  }
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user || !user.isActive) throw new HttpError(401, "User account is unavailable");
  return publicUser(user);
}
