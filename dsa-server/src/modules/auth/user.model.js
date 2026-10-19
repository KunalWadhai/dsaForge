import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

export const User = mongoose.model("User", userSchema);
