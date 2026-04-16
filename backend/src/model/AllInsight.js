import mongoose from "mongoose";

const aiInsightSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weekKey: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    riskFlags: {
      type: [String],
      default: [],
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.7,
    },
    modelVersion: {
      type: String,
      default: "rule-based-v1",
    },
  },
  {
    timestamps: true,
    collection: "ai_insights",
  },
);

aiInsightSchema.index({ user: 1, weekKey: 1 }, { unique: true });

const AllInsight = mongoose.model("AllInsight", aiInsightSchema);

export default AllInsight;
