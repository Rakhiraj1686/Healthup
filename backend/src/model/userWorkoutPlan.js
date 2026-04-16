import mongoose from "mongoose";

const userWorkoutPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    weekStartDate: Date,
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
  },

  { timestamps: true },
);

export default mongoose.model("UserWorkoutPlan", userWorkoutPlanSchema);
