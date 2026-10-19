import { randomUUID } from "node:crypto";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HttpError } from "../../utils/httpError.js";
import { Conversation } from "../conversations/conversation.model.js";
import { answerDsaQuestion } from "./rag.service.js";

export const listConversations = asyncHandler(async (req, res) => {
  const docs = await Conversation.find({ userId: req.user.id })
    .sort({ lastMessageAt: -1 }).limit(100).select("title lastMessageAt createdAt updatedAt");
  res.json({ success: true, data: docs.map(doc => ({
    id: String(doc._id), title: doc.title, updatedAt: doc.lastMessageAt.toISOString(),
  })) });
});

export const createConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.create({
    userId: req.user.id, title: req.body.title || "New conversation",
  });
  res.status(201).json({ success: true, data: { id: String(conversation._id), title: conversation.title } });
});

export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.conversationId, userId: req.user.id });
  if (!conversation) throw new HttpError(404, "Conversation not found");
  res.json({ success: true, data: {
    id: String(conversation._id), title: conversation.title,
    messages: conversation.messages.map(m => ({
      id: String(m._id), role: m.role, content: m.content, sources: m.sources, createdAt: m.createdAt,
    })),
  } });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.conversationId, userId: req.user.id });
  if (!conversation) throw new HttpError(404, "Conversation not found");

  const question = req.body.message.trim();
  const history = conversation.messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
  conversation.messages.push({ role: "user", content: question });
  if (conversation.title === "New conversation") {
    conversation.title = question.length > 60 ? `${question.slice(0, 57)}...` : question;
  }

  const result = await answerDsaQuestion(question, history);
  const assistantMessage = {
    role: "assistant", content: result.answer,
    sources: result.sources.map(s => ({
      title: s.title, ...(typeof s.score === "number" ? { score: s.score } : {}),
      ...(typeof s.page === "number" ? { page: s.page } : {}),
      ...(s.source ? { source: s.source } : {}),
    })),
  };
  conversation.messages.push(assistantMessage);
  conversation.lastMessageAt = new Date();
  await conversation.save();

  const saved = conversation.messages[conversation.messages.length - 1];
  res.json({ success: true, data: {
    id: String(saved._id || randomUUID()), answer: result.answer, sources: result.sources,
    conversationId: String(conversation._id), title: conversation.title,
  } });
});

export const deleteConversation = asyncHandler(async (req, res) => {
  const result = await Conversation.deleteOne({ _id: req.params.conversationId, userId: req.user.id });
  if (!result.deletedCount) throw new HttpError(404, "Conversation not found");
  res.status(204).end();
});
