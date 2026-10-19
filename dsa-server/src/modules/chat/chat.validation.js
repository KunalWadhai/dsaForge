import { z } from "zod";
import { env } from "../../config/env.js";

export const sendMessageSchema = z.object({
  message: z.string().trim().min(1).max(env.MAX_MESSAGE_LENGTH),
}).strict();

export const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
}).strict();
