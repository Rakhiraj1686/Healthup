import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
    },
    exercise: {
      type: String,
      required: true,
    },
    sets: Number,
    reps: Number,
  },
  { timestamps: true },
);

export default mongoose.model("Workout", workoutSchema);
