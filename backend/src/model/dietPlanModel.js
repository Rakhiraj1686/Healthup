const dietPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    macroSplit: {
      protein: Number,
      carbs: Number,
      fat: Number,
    },

    meals: [
      {
        mealName: String,
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("DietPlan", dietPlanSchema);
