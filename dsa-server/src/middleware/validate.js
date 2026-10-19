import { HttpError } from "../utils/httpError.js";

export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new HttpError(400, "Request validation failed", result.error.flatten()));
    }
    req.body = result.data;
    next();
  };
}
