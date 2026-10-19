import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import * as controller from "./chat.controller.js";
import { createConversationSchema, sendMessageSchema } from "./chat.validation.js";

const router = Router();
const chatLimiter = rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false, message: { success: false, message: "Chat rate limit reached. Please wait a moment." } });

router.use(requireAuth);
router.get("/conversations", controller.listConversations);
router.post("/conversations", validateBody(createConversationSchema), controller.createConversation);
router.get("/conversations/:conversationId", controller.getConversation);
router.post("/conversations/:conversationId/messages", chatLimiter, validateBody(sendMessageSchema), controller.sendMessage);
router.delete("/conversations/:conversationId", controller.deleteConversation);

export default router;
