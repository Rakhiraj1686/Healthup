import DailyProgress from "../model/DailyProgress.js";
import WorkoutLog from "../model/WorkoutLog.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const round1 = (value) => Number(Number(value || 0).toFixed(1));

const mealLibrary = {
  vegetarian: {
    breakfast: [
      ["Overnight Oats", "Greek Yogurt", "Chia Seeds"],
      ["Besan Chilla", "Mint Curd", "Fruit"],
      ["Paneer Toast", "Boiled Chickpeas", "Green Tea"],
    ],
    lunch: [
      ["Dal", "Brown Rice", "Cucumber Salad"],
      ["Paneer Curry", "Millet Roti", "Carrot Salad"],
      ["Rajma", "Rice", "Curd"],
    ],
    dinner: [
      ["Tofu Stir Fry", "Quinoa", "Soup"],
      ["Moong Khichdi", "Curd", "Sauteed Veg"],
      ["Paneer Tikka", "Roti", "Salad"],
    ],
  },
  nonvegetarian: {
    breakfast: [
      ["Egg Omelette", "Whole Wheat Toast", "Fruit"],
      ["Oats", "Boiled Eggs", "Black Coffee"],
      ["Chicken Sandwich", "Curd"],
    ],
    lunch: [
      ["Grilled Chicken", "Brown Rice", "Salad"],
      ["Fish Curry", "Rice", "Steamed Veg"],
      ["Chicken Bowl", "Quinoa", "Yogurt"],
    ],
    dinner: [
      ["Baked Fish", "Sweet Potato", "Salad"],
      ["Chicken Stir Fry", "Millet", "Soup"],
      ["Egg Curry", "Roti", "Veg Mix"],
    ],
  },
};

const getMealPool = (foodPreference = "") => {
  const normalized = String(foodPreference || "").toLowerCase();
  if (normalized === "all") {
    return {
      breakfast: [...mealLibrary.vegetarian.breakfast, ...mealLibrary.nonvegetarian.breakfast],
      lunch: [...mealLibrary.vegetarian.lunch, ...mealLibrary.nonvegetarian.lunch],
      dinner: [...mealLibrary.vegetarian.dinner, ...mealLibrary.nonvegetarian.dinner],
    };
  }
  if (normalized === "vegetarian" || normalized === "vegan") {
    return mealLibrary.vegetarian;
  }
  return mealLibrary.nonvegetarian;
};

const getDefaultMacroRatio = (goal = "") => {
  const normalized = String(goal || "").toLowerCase();
  if (normalized.includes("weight") && normalized.includes("loss")) {
    return { protein: 0.4, carbs: 0.3, fats: 0.3 };
  }
  if (normalized.includes("muscle") && normalized.includes("gain")) {
    return { protein: 0.3, carbs: 0.5, fats: 0.2 };
  }
  return { protein: 0.3, carbs: 0.4, fats: 0.3 };
};

export const buildAdvancedMacroCustomization = ({ user, preferences = {} }) => {
  const baseCalories = Number(user.targetCalories || user.calorieTarget || user.maintenanceCalories || 2000);
  const baseRatio = getDefaultMacroRatio(user.goal || user.primaryGoal);

  const proteinRatio = clamp(Number(preferences.proteinRatio ?? baseRatio.protein), 0.2, 0.55);
  const carbsRatio = clamp(Number(preferences.carbsRatio ?? baseRatio.carbs), 0.15, 0.6);
  const fatsRatio = clamp(Number(preferences.fatsRatio ?? baseRatio.fats), 0.15, 0.45);

  const ratioTotal = proteinRatio + carbsRatio + fatsRatio;
  const normalizedProtein = proteinRatio / ratioTotal;
  const normalizedCarbs = carbsRatio / ratioTotal;
  const normalizedFats = fatsRatio / ratioTotal;

  const calorieDelta = Number(preferences.calorieDelta || 0);
  const customizedCalories = clamp(Math.round(baseCalories + calorieDelta), 1200, 4200);

  // Premium Coaching Layer - Point 1: Advanced macro customization using user-defined macro ratios.
  const customizedMacros = {
    protein: Math.round((customizedCalories * normalizedProtein) / 4),
    carbs: Math.round((customizedCalories * normalizedCarbs) / 4),
    fats: Math.round((customizedCalories * normalizedFats) / 9),
  };

  return {
    baseCalories,
    customizedCalories,
    appliedRatio: {
      protein: round1(normalizedProtein * 100),
      carbs: round1(normalizedCarbs * 100),
      fats: round1(normalizedFats * 100),
    },
    customizedMacros,
    note: "Macro split normalized and applied to updated calorie target",
  };
};

export const buildMealSwapEngine = ({ user, mealName = "breakfast", excludeItems = [] }) => {
  const pool = getMealPool(user.foodPreference);
  const normalizedMeal = String(mealName || "breakfast").toLowerCase();
  const options = pool[normalizedMeal] || pool.breakfast;
  const blocked = new Set((excludeItems || []).map((item) => String(item).toLowerCase()));

  // Premium Coaching Layer - Point 2: Meal swap engine proposes equivalent alternatives from same meal slot.
  const swaps = options
    .filter((combo) => !combo.some((item) => blocked.has(String(item).toLowerCase())))
    .slice(0, 3)
    .map((combo, index) => ({
      swapId: `${normalizedMeal}-${index + 1}`,
      mealType: normalizedMeal,
      items: combo,
      guidance: "Swap keeps similar structure (protein + carb + fiber)",
    }));

  return {
    mealType: normalizedMeal,
    totalSwaps: swaps.length,
    swaps,
  };
};

export const buildPersonalizedMealAdjustments = ({ user, recentDailyProgress = [], macroPlan }) => {
  const avgDietAdherence = recentDailyProgress.length
    ? recentDailyProgress.reduce((sum, row) => sum + Number(row.dietAdherencePercent || 0), 0) /
      recentDailyProgress.length
    : 0;

  const avgCalories = recentDailyProgress.length
    ? recentDailyProgress.reduce((sum, row) => sum + Number(row.caloriesIn || 0), 0) /
      recentDailyProgress.length
    : 0;

  const calorieGap = round1(avgCalories - Number(macroPlan.customizedCalories || 0));
  const adjustments = [];

  // Premium Coaching Layer - Point 3: Personalized meal adjustments adapt meals using adherence + intake trends.
  if (avgDietAdherence < 60) {
    adjustments.push("Simplify meal prep: use 2 rotating breakfasts and pre-portioned lunches.");
  }
  if (calorieGap > 150) {
    adjustments.push("Reduce calorie-dense add-ons at dinner and increase salad volume.");
  } else if (calorieGap < -150) {
    adjustments.push("Add one protein-carb snack in afternoon to reduce under-eating.");
  }
  if (!adjustments.length) {
    adjustments.push("Current intake is aligned. Keep meal timing and hydration consistent.");
  }

  return {
    avgDietAdherence: round1(avgDietAdherence),
    avgCaloriesIn: round1(avgCalories),
    calorieGap,
    adjustments,
  };
};

export const buildDeeperRecoveryInsights = ({ recentWorkoutLogs = [], recentDailyProgress = [] }) => {
  const completed = recentWorkoutLogs.filter((log) => log.status === "completed");
  const avgRpe = completed.length
    ? completed.reduce((sum, log) => sum + Number(log.effortRpe || 0), 0) / completed.length
    : 0;

  const energyMap = {
    energized: 100,
    normal: 75,
    slightly_fatigued: 45,
    very_tired: 20,
  };

  const avgEnergy = recentDailyProgress.length
    ? recentDailyProgress.reduce(
        (sum, row) => sum + Number(energyMap[row.energyLevel] ?? 70),
        0,
      ) / recentDailyProgress.length
    : 70;

  const missedSessions = recentWorkoutLogs.filter((log) => ["missed", "skipped"].includes(log.status)).length;
  const strainPenalty = clamp(avgRpe * 6 + missedSessions * 8, 0, 70);
  const recoveryScore = clamp(Math.round(avgEnergy - strainPenalty / 2 + 35), 0, 100);

  // Premium Coaching Layer - Point 5: Deeper recovery insights combine intensity, missed sessions, and energy trends.
  const insights = {
    recoveryScore,
    fatigueRisk:
      recoveryScore < 45 ? "high" : recoveryScore < 70 ? "moderate" : "low",
    recommendations: [],
  };

  if (insights.fatigueRisk === "high") {
    insights.recommendations.push("Take 1 full deload day and keep next sessions at RPE 6-7.");
    insights.recommendations.push("Prioritize sleep 7.5+ hrs and hydration with electrolytes.");
  } else if (insights.fatigueRisk === "moderate") {
    insights.recommendations.push("Maintain training but reduce one session volume by 20% this week.");
  } else {
    insights.recommendations.push("Recovery is solid. Continue progressive overload gradually.");
  }

  return {
    avgRpe: round1(avgRpe),
    avgEnergyScore: round1(avgEnergy),
    missedSessions,
    ...insights,
  };
};

export const getPremiumCoachingLayerData = async (user, options = {}) => {
  const days = clamp(Number(options.days || 14), 7, 30);
  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [recentDailyProgress, recentWorkoutLogs] = await Promise.all([
    DailyProgress.find({ user: user._id, date: { $gte: fromDate } })
      .sort({ date: -1 })
      .select("date caloriesIn dietAdherencePercent energyLevel"),
    WorkoutLog.find({ user: user._id, scheduledDate: { $gte: fromDate } })
      .sort({ scheduledDate: -1 })
      .select("scheduledDate status effortRpe durationMin"),
  ]);

  const macroPlan = buildAdvancedMacroCustomization({
    user,
    preferences: options.macroPreferences || {},
  });

  const mealSwapEngine = buildMealSwapEngine({
    user,
    mealName: options.mealName || "breakfast",
    excludeItems: options.excludeItems || [],
  });

  const mealAdjustments = buildPersonalizedMealAdjustments({
    user,
    recentDailyProgress,
    macroPlan,
  });

  const recoveryInsights = buildDeeperRecoveryInsights({
    recentWorkoutLogs,
    recentDailyProgress,
  });

  return {
    // Premium Coaching Layer - Aggregated response with all premium modules in one payload.
    advancedMacroCustomization: macroPlan,
    mealSwapEngine,
    personalizedMealAdjustments: mealAdjustments,
    deeperRecoveryInsights: recoveryInsights,
    metadata: {
      lookbackDays: days,
      generatedAt: new Date(),
    },
  };
};
