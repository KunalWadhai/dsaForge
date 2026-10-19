import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as controller from "./auth.controller.js";
import { validateBody } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, standardHeaders: "draft-7", legacyHeaders: false, message: { success: false, message: "Too many authentication attempts. Try again later." } });

router
.post(
    "/register", 
    authLimiter, 
    validateBody(registerSchema), 
    controller.register
)
.post(
    "/login", 
    authLimiter, 
    validateBody(loginSchema), 
    controller.login
)
.post(
    "/refresh", 
    authLimiter, 
    controller.refresh
)
.post(
    "/logout", 
    controller.logout
)
.get(
    "/me", 
    requireAuth, 
    controller.me
);

export default router;
