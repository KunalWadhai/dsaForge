import { verifyAccessToken } from "../utils/tokens.js";
import { HttpError } from "../utils/httpError.js";

export function requireAuth(req, _res, next) {
  const authorization = req.get("authorization") || "";
  
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Access token is required"));
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new HttpError(401, "Access token is invalid or expired"));
  }
}
