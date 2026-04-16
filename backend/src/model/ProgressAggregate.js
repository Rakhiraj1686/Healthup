import mongoose from "mongoose";

const progressAggregateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    periodType: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true,
    },
    periodKey: {
      type: String,
      required: true,
    },
    avgWeightKg: Number,
    workoutCompletionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    adherenceAvg: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    goalProgressPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "progress_aggregates",
  },
);

progressAggregateSchema.index({ user: 1, periodType: 1, periodKey: 1 }, { unique: true });

const ProgressAggregate = mongoose.model("ProgressAggregate", progressAggregateSchema);

export default ProgressAggregate;
