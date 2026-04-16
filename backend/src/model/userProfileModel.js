import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ===== AUTH FIELDS =====
    fullName: {
      type: String,
      required: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isActive: { type: Boolean, default: true },

    // ===== HEALTH PROFILE (OPTIONAL INITIALLY) =====
    photo: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },

    foodPreference: {
      type: String,
      enum: ["vegetarian", "vegan", "nonvegetarian", "all"],
    },

    age: String,

    biologicalSex: {
      type: String,
      enum: ["male", "female", "other"],
    },

    height: String, // cm
    weight: String, // kg

    activityLevel: {
      type: String,
      enum: ["sedentary", "lightly active", "moderately active", "very active"],
    },

    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },

    workoutPreference: {
      type: String,
      enum: [
        "strength_training",
        "cardio",
        "hiit",
        "endurance_training",
        "functional_training",
        "flexibility_mobility_workout",
      ],
    },

    bmi: Number,
    bmr: Number,
    maintenanceCalories: Number,

    goal: {
      type: String,
      default: "maintain",
    },

    targetCalories: Number,

    macros: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fats: { type: Number, default: 0 },
    },

    aiPlan: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    primaryGoal: {
      type: String,
      enum: [
        "weight loss",
        "muscle gain",
        "body recomposition",
        "maintain",
        "improve endurance",
      ],
      default: "maintain",
    },

    goalWeight: {
      type: Number,
    },

    goalStatus: {
      type: String,
      enum: ["ongoing", "at-risk", "completed"],
      default: "ongoing",
    },

    // Goal tracking
    calorieTarget: {
      type: Number,
      default: 2000,
    },

    workoutsPerWeek: {
      type: Number,
      default: 5,
    },

    // Weekly smart engine writes adjustment audit here (trigger, metrics, safety changes).
    lastPlanAdjustment: {
      appliedAt: Date,
      weekKey: String,
      automated: { type: Boolean, default: false },
      skipped: { type: Boolean, default: false },
      reason: String,
      simplifyWorkouts: { type: Boolean, default: false },
      triggers: [
        {
          trigger: String,
          message: String,
        },
      ],
      adjustments: mongoose.Schema.Types.Mixed,
      weeklyMetrics: mongoose.Schema.Types.Mixed,
      previousCalories: Number,
      newCalories: Number,
    },

    // Useful flag
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
