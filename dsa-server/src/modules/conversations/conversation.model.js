import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true, maxlength: 30000 },
  sources: [{ title: String, score: Number, page: Number, source: String }],
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, maxlength: 120, default: "New conversation" },
  messages: { type: [messageSchema], default: [] },
  lastMessageAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true, versionKey: false });

conversationSchema.index({ userId: 1, lastMessageAt: -1 });
export const Conversation = mongoose.model("Conversation", conversationSchema);
