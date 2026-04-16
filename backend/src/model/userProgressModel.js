// const progressLogSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

//     weekStartDate: Date,

//     workoutAdherencePercent: Number,
//     dietAdherencePercent: Number,

//     habitScore: Number,
//     currentStreak: Number,
//     dropOffRisk: { type: Boolean, default: false },

//     energyLevel: {
//       type: String,
//       enum: ["energized", "normal", "slightly fatigued", "very tired"],
//     },

//     dietAdherence: {
//       type: String,
//       enum: ["followed", "mostly", "deviated"],
//     },
    
//     workoutCompletion: {
//       type: String,
//       enum: ["completed", "partial", "skipped"],
//     },

//     days: [
//       {
//         dayName: String,
//         focus: String,
//         exercises: [
//           {
//             name: String,
//             sets: Number,
//             reps: String,
//             rest: String,
//             formGuide: String,
//           },
//         ],
//       },
//     ],
//   },
//   { timestamps: true },
// );

// export default mongoose.model("ProgressLog", progressLogSchema);

import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    workoutAdherencePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    dietAdherencePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    habitScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    weight: Number,
    bmi: Number,
    bodyFat: Number,
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, date: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;
