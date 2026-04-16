import mongoose from "mongoose";

const dailyProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    goalType: {
      type: String,
      enum: ["weight_loss", "muscle_gain", "maintenance"],
      default: "maintenance",
    },
    weightKg: {
      type: Number,
      min: 20,
      max: 400,
    },
    bodyFatPct: {
      type: Number,
      min: 2,
      max: 70,
    },
    workoutsPlanned: {
      type: Number,
      default: 0,
      min: 0,
    },
    workoutsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    caloriesIn: {
      type: Number,
      min: 0,
    },
    dietAdherencePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    habitAdherencePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    proteinG: {
      type: Number,
      min: 0,
    },
    energyLevel: {
      type: String,
      enum: ["energized", "normal", "slightly_fatigued", "very_tired"],
      default: "normal",
    },
    waistCm: {
      type: Number,
      min: 0,
    },
    chestCm: {
      type: Number,
      min: 0,
    },
    hipsCm: {
      type: Number,
      min: 0,
    },
    armsCm: {
      type: Number,
      min: 0,
    },
    thighsCm: {
      type: Number,
      min: 0,
    },
    steps: {
      type: Number,
      min: 0,
    },
    adherenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    weekKey: {
      type: String,
      index: true,
    },
    monthKey: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "daily_progress",
  },
);

dailyProgressSchema.index({ user: 1, date: 1 }, { unique: true });
dailyProgressSchema.index({ user: 1, weekKey: 1 });
dailyProgressSchema.index({ user: 1, monthKey: 1 });

const DailyProgress = mongoose.model("DailyProgress", dailyProgressSchema);

export default DailyProgress;
