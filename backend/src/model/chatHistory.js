import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    //gemini usage tracking

    aiUsage: {
      messagesUsed: { type: Number, default: 0 },
      lastReset: Date,
    },
    question: String,
    response: String,
  },
  { timestamps: true },
);

export default mongoose.model("ChatHistory", chatHistorySchema);
