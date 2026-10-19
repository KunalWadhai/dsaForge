import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  refreshTokenHash: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  revokedAt: { type: Date, default: null },
  userAgent: { type: String, maxlength: 500 },
  ipAddress: { type: String, maxlength: 100 },
}, { timestamps: true, versionKey: false });

export const Session = mongoose.model("Session", sessionSchema);
