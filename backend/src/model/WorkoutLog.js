import mongoose from "mongoose";

const workoutLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planWorkoutId: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["completed", "missed", "skipped", "rest"],
      required: true,
    },
    effortRpe: {
      type: Number,
      min: 1,
      max: 10,
    },
    durationMin: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "workout_logs",
  },
);

workoutLogSchema.index({ user: 1, scheduledDate: 1 });

const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema);

export default WorkoutLog;
