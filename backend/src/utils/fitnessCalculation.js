// ---------------- BMR ----------------
export const calculateBMR = ({ weight, height, age, biologicalSex }) => {
  if (!weight || !height || !age || !biologicalSex) return null;

  if (biologicalSex === "male") {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  }

  if (biologicalSex === "female") {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }

  return null;
};

// ---------------- Activity Multiplier ----------------
const activityMultipliers = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  athlete: 1.9,
};

export const calculateMaintenanceCalories = (bmr, activityLevel) => {
  if (!bmr || !activityMultipliers[activityLevel]) return null;
  return Math.round(bmr * activityMultipliers[activityLevel]);
};

// ---------------- Goal Based Calories ----------------
export const calculateTargetCalories = ({ maintenanceCalories, goal }) => {
  if (!maintenanceCalories) return null;

  switch (goal) {
    case "weight_loss":
      return maintenanceCalories - 500;

    case "aggressive_loss":
      return maintenanceCalories - 750;

    case "weight_gain":
      return maintenanceCalories + 400;

    case "lean_gain":
      return maintenanceCalories + 250;

    case "maintenance":
    default:
      return maintenanceCalories;
  }
};

// ---------------- Protein ----------------
const calculateProtein = (weight, goal) => {
  if (!weight) return null;

  if (goal === "weight_loss") return Math.round(weight * 2.2);
  if (goal === "weight_gain") return Math.round(weight * 1.8);

  return Math.round(weight * 1.6);
};

// ---------------- Fat ----------------
const calculateFat = (targetCalories, goal) => {
  if (!targetCalories) return null;

  let fatPercentage = 0.25;

  if (goal === "weight_loss") fatPercentage = 0.30;
  if (goal === "weight_gain") fatPercentage = 0.25;

  const fatCalories = targetCalories * fatPercentage;
  return Math.round(fatCalories / 9);
};

// ---------------- Carbs ----------------
const calculateCarbs = (targetCalories, proteinGrams, fatGrams) => {
  if (!targetCalories || !proteinGrams || !fatGrams) return null;

  const proteinCalories = proteinGrams * 4;
  const fatCalories = fatGrams * 9;

  const remainingCalories = targetCalories - (proteinCalories + fatCalories);

  return Math.round(remainingCalories / 4);
};

// ---------------- Macro Generator ----------------
export const generateMacros = ({ weight, goal, targetCalories }) => {
  const protein = calculateProtein(weight, goal);
  const fat = calculateFat(targetCalories, goal);
  const carbs = calculateCarbs(targetCalories, protein, fat);

  return {
    protein,
    fats: fat,
    carbs,
  };
};

// ---------------- Workout Frequency ----------------
const generateWorkoutFrequency = (experienceLevel) => {
  switch (experienceLevel) {
    case "beginner":
      return 3;
    case "intermediate":
      return 4;
    case "advanced":
      return 5;
    default:
      return 3;
  }
};

// ---------------- Workout Split ----------------
const generateWorkoutSplit = ({ goal, experienceLevel }) => {
  if (goal === "weight_loss") {
    return "Strength + Cardio Mix";
  }

  if (goal === "weight_gain") {
    return experienceLevel === "advanced"
      ? "Push Pull Legs"
      : "Upper Lower Split";
  }

  return "Full Body Training";
};

// ---------------- AI Plan Generator ----------------
export const generateAIPlan = (user) => {
  const workoutDays = generateWorkoutFrequency(user.experienceLevel);
  const workoutType = generateWorkoutSplit({
    goal: user.goal,
    experienceLevel: user.experienceLevel,
  });

  return {
    goal: user.goal,
    targetCalories: user.targetCalories,
    macros: user.macros,
    workoutDaysPerWeek: workoutDays,
    workoutType,
    cardioRecommendation:
      user.goal === "weight_loss" ? "20 min post workout cardio" : "Optional",
    progressionStrategy:
      user.goal === "weight_gain"
        ? "Increase weights weekly"
        : "Focus on consistency",
  };
};