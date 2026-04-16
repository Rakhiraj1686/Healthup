import mongoose from "mongoose";

const streakStateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentStreakDays: {
      type: Number,
      default: 0,
    },
    longestStreakDays: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    freezeTokens: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "streak_states",
  },
);

const StreakState = mongoose.model("StreakState", streakStateSchema);

export default StreakState;
