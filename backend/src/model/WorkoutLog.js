import mongoose from "mongoose";

const workoutLogSchema = new mongoose.Schema(
  {
    // Shared owner field
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // From userWorkoutPlan schema
    weekStartDate: {
      type: Date,
      default: null,
    },
    days: [
      {
        dayName: String,
        focus: String,
        exercises: [
          {
            name: String,
            sets: Number,
            reps: String,
            rest: String,
            formGuide: String,
          },
        ],
      },
    ],

    // From Workout schema
    day: {
      type: String,
      default: null,
    },
    exercise: {
      type: String,
      default: null,
    },
    sets: {
      type: Number,
      default: null,
    },
    reps: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Existing workout log fields
    planWorkoutId: {
      type: String,
      default: null,
    },
    scheduledDate: {
      type: Date,
      default: null,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["completed", "missed", "skipped", "rest"],
      default: null,
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
workoutLogSchema.index({ user: 1, weekStartDate: 1 });

const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema);

export default WorkoutLog;
