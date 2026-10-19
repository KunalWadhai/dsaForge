import { asyncHandler } from "../../utils/asyncHandler.js";
import { HttpError } from "../../utils/httpError.js";
import { env } from "../../config/env.js";
import * as authService from "./auth.service.js";

const REFRESH_COOKIE = "dsa_refresh";
const cookieOptions = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  path: `${env.API_PREFIX}/auth`,
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
});

function setSessionCookies(res, result) {
  res.cookie(REFRESH_COOKIE, result.refreshToken, {
    ...cookieOptions(), maxAge: env.REFRESH_TOKEN_TTL_DAYS * 86400000,
  });
  // Access token is returned in JSON for this API contract. Keep it in memory on the client,
  // or use a Next.js BFF to keep it out of browser JavaScript.
}

function requestMeta(req) {
  return { userAgent: req.get("user-agent") || "", ipAddress: req.ip };
}

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body, requestMeta(req));
  setSessionCookies(res, result);
  res.status(201).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, requestMeta(req));
  setSessionCookies(res, result);
  res.json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refreshSession(req.cookies[REFRESH_COOKIE]);
  setSessionCookies(res, result);
  res.json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies[REFRESH_COOKIE]);
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
  res.status(200).json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.json({ success: true, data: { user } });
});

export const REFRESH_COOKIE_NAME = REFRESH_COOKIE;
