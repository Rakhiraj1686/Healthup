import groq from "../config/groq.js";

const pickRandom = (items = [], count = 1) => {
  const copied = [...items];
  const selected = [];
  while (copied.length && selected.length < count) {
    const index = Math.floor(Math.random() * copied.length);
    selected.push(copied.splice(index, 1)[0]);
  }
  return selected;
};

const getMacroDistribution = (goal = "") => {
  const normalized = String(goal || "").toLowerCase();
  if (normalized.includes("weight") && normalized.includes("loss")) {
    return { protein: 0.4, carbs: 0.3, fats: 0.3 };
  }
  if (normalized.includes("muscle") && normalized.includes("gain")) {
    return { protein: 0.3, carbs: 0.5, fats: 0.2 };
  }
  return { protein: 0.3, carbs: 0.4, fats: 0.3 };
};

const getMealPool = (foodPreference = "") => {
  const vegetarianPool = {
    breakfast: [
      ["Oats + Peanut Butter", "Greek Yogurt", "Fruit"],
      ["Besan Chilla", "Paneer", "Green Tea"],
      ["Poha", "Boiled Sprouts", "Buttermilk"],
      ["Ragi Dosa", "Coconut Chutney", "Herbal Tea"],
      ["Paneer Sandwich", "Apple", "Lemon Water"],
      ["Upma", "Roasted Chana", "Curd"],
    ],
    lunch: [
      ["Dal", "Brown Rice", "Salad"],
      ["Paneer Bhurji", "Roti", "Cucumber Salad"],
      ["Rajma", "Rice", "Curd"],
      ["Chole", "Jeera Rice", "Kachumber Salad"],
      ["Mixed Veg", "Millet Roti", "Curd"],
      ["Soya Chunk Curry", "Roti", "Salad"],
    ],
    dinner: [
      ["Tofu Stir Fry", "Quinoa", "Soup"],
      ["Paneer Tikka", "Millet Roti", "Salad"],
      ["Moong Khichdi", "Curd", "Sauteed Veg"],
      ["Lentil Soup", "Veg Stir Fry", "Toasted Seeds"],
      ["Palak Paneer", "Roti", "Salad"],
      ["Vegetable Oats", "Curd", "Steamed Broccoli"],
    ],
  };

  const veganPool = {
    breakfast: [
      ["Overnight Oats", "Chia Seeds", "Banana"],
      ["Tofu Scramble", "Whole Wheat Toast", "Fruit"],
      ["Poha", "Peanuts", "Lemon Water"],
      ["Smoothie Bowl", "Pumpkin Seeds", "Berries"],
      ["Millet Porridge", "Almond Butter", "Papaya"],
    ],
    lunch: [
      ["Dal", "Brown Rice", "Salad"],
      ["Chickpea Curry", "Roti", "Cucumber Salad"],
      ["Tofu Bhurji", "Millet Roti", "Veg Salad"],
      ["Quinoa Bowl", "Beans", "Sauteed Veg"],
      ["Rajma", "Rice", "Beetroot Salad"],
    ],
    dinner: [
      ["Tofu Stir Fry", "Quinoa", "Soup"],
      ["Lentil Khichdi", "Sauteed Veg", "Sprouts"],
      ["Vegetable Soup", "Grilled Tofu", "Salad"],
      ["Chickpea Salad", "Roasted Sweet Potato", "Broccoli"],
      ["Soya Curry", "Roti", "Mixed Greens"],
    ],
  };

  const nonVegPool = {
    breakfast: [
      ["Egg Omelette", "Whole Wheat Toast", "Fruit"],
      ["Oats", "Boiled Eggs", "Green Tea"],
      ["Chicken Sandwich", "Curd"],
      ["Egg Bhurji", "Roti", "Orange"],
      ["Greek Yogurt", "Nuts", "Boiled Eggs"],
      ["Chicken Sausage", "Multigrain Toast", "Fruit"],
    ],
    lunch: [
      ["Grilled Chicken", "Brown Rice", "Salad"],
      ["Fish Curry", "Rice", "Steamed Veg"],
      ["Chicken Bowl", "Quinoa", "Yogurt"],
      ["Egg Curry", "Roti", "Kachumber Salad"],
      ["Chicken Keema", "Millet Roti", "Cucumber"],
      ["Tuna Salad Bowl", "Sweet Corn", "Lemon Dressing"],
    ],
    dinner: [
      ["Baked Fish", "Sweet Potato", "Salad"],
      ["Chicken Stir Fry", "Millet", "Soup"],
      ["Egg Curry", "Roti", "Veg Mix"],
      ["Grilled Chicken", "Sauteed Veg", "Soup"],
      ["Fish Tikka", "Quinoa", "Salad"],
      ["Egg White Omelette", "Stir Fry Veg", "Lentil Soup"],
    ],
  };

  const normalized = String(foodPreference || "").toLowerCase().trim();
  const isAll = ["all", "mixed", "any", "both"].includes(normalized);
  const isVeg = ["vegetarian", "veg", "eggetarian"].includes(normalized);
  const isVegan = ["vegan", "plant_based", "plant-based"].includes(normalized);
  const isNonVeg = ["non_vegetarian", "non-vegetarian", "non veg", "nonveg", "nv"].includes(normalized);

  if (isAll) {
    return {
      breakfast: [...vegetarianPool.breakfast, ...veganPool.breakfast, ...nonVegPool.breakfast],
      lunch: [...vegetarianPool.lunch, ...veganPool.lunch, ...nonVegPool.lunch],
      dinner: [...vegetarianPool.dinner, ...veganPool.dinner, ...nonVegPool.dinner],
    };
  }
  if (isVegan) {
    return veganPool;
  }
  if (isVeg) {
    return vegetarianPool;
  }
  if (isNonVeg) {
    return nonVegPool;
  }

  return nonVegPool;
};

const buildMeals = ({ calories, macros, foodPreference }) => {
  const pool = getMealPool(foodPreference);
  const breakfast = pickRandom(pool.breakfast, 1)[0] || [];
  const lunch = pickRandom(pool.lunch, 1)[0] || [];
  const dinner = pickRandom(pool.dinner, 1)[0] || [];

  return [
    {
      mealName: "Breakfast",
      time: "7:00 AM - 8:00 AM",
      calories: Math.round(calories * 0.28),
      items: breakfast,
      macros: {
        protein: Math.round(macros.protein * 0.28),
        carbs: Math.round(macros.carbs * 0.28),
        fats: Math.round(macros.fats * 0.28),
      },
    },
    {
      mealName: "Lunch",
      time: "1:00 PM - 2:00 PM",
      calories: Math.round(calories * 0.37),
      items: lunch,
      macros: {
        protein: Math.round(macros.protein * 0.37),
        carbs: Math.round(macros.carbs * 0.37),
        fats: Math.round(macros.fats * 0.37),
      },
    },
    {
      mealName: "Dinner",
      time: "7:30 PM - 8:30 PM",
      calories: Math.round(calories * 0.35),
      items: dinner,
      macros: {
        protein: Math.round(macros.protein * 0.35),
        carbs: Math.round(macros.carbs * 0.35),
        fats: Math.round(macros.fats * 0.35),
      },
    },
  ];
};

const getWorkoutTemplate = (level = "beginner", workoutPreference = "") => {
  const beginner = [
    { focus: "Strength Training (Upper Body)", exercises: ["Push-ups", "Rows", "Shoulder Press"] },
    { focus: "Strength Training (Lower Body)", exercises: ["Squats", "Lunges", "Glute Bridge"] },
    { focus: "Core + Mobility", exercises: ["Plank", "Dead Bug", "Stretching"] },
    { focus: "Cardio", exercises: ["Brisk Walk", "Cycling", "Step-ups"] },
    { focus: "Strength Training (Full Body)", exercises: ["Bodyweight Circuit", "Burpees", "Mountain Climbers"] },
  ];

  const intermediate = [
    { focus: "Chest + Triceps", exercises: ["Bench Press", "Dips", "Cable Pushdown"] },
    { focus: "Back + Biceps", exercises: ["Rows", "Pull-down", "Hammer Curl"] },
    { focus: "Legs", exercises: ["Squat", "RDL", "Leg Press"] },
    { focus: "Shoulders + Core", exercises: ["Overhead Press", "Lateral Raise", "Plank"] },
    { focus: "Conditioning", exercises: ["HIIT Intervals", "Kettlebell Swings", "Jump Rope"] },
  ];

  const advanced = [
    { focus: "Push", exercises: ["Incline Press", "OHP", "Weighted Dips"] },
    { focus: "Pull", exercises: ["Deadlift", "Pull-ups", "Rows"] },
    { focus: "Leg Power", exercises: ["Front Squat", "Lunges", "Hip Thrust"] },
    { focus: "Hypertrophy", exercises: ["Accessory Circuit", "Supersets", "Core Finisher"] },
    { focus: "Athletic Conditioning", exercises: ["Sprint Intervals", "Sled Push", "Battle Rope"] },
  ];

  const workoutTypeTemplates = {
    strength_training: [
      { focus: "Strength Training - Push", exercises: ["Bench Press", "Overhead Press", "Dips"] },
      { focus: "Strength Training - Pull", exercises: ["Rows", "Pull-down", "Deadlift"] },
      { focus: "Strength Training - Legs", exercises: ["Squat", "Lunges", "Leg Press"] },
      { focus: "Strength Training - Full Body", exercises: ["Thrusters", "RDL", "Push-ups"] },
      { focus: "Strength Training - Core", exercises: ["Plank", "Hanging Knee Raise", "Pallof Press"] },
    ],
    endurance_training: [
      { focus: "Endurance Training - Base Run", exercises: ["Steady Run", "Breathing Drill", "Cooldown Walk"] },
      { focus: "Endurance Training - Tempo", exercises: ["Tempo Jog", "Stride Intervals", "Recovery Walk"] },
      { focus: "Endurance Training - Cycling", exercises: ["Long Ride", "Cadence Drill", "Easy Spin"] },
      { focus: "Endurance Training - Mixed Cardio", exercises: ["Rowing", "Elliptical", "Incline Walk"] },
      { focus: "Endurance Training - Recovery", exercises: ["Zone 2 Walk", "Mobility", "Breathwork"] },
    ],
    functional_training: [
      { focus: "Functional Training - Movement", exercises: ["Farmer Carry", "Goblet Squat", "Step-up"] },
      { focus: "Functional Training - Stability", exercises: ["Single-leg RDL", "Split Squat", "Band Row"] },
      { focus: "Functional Training - Core", exercises: ["Dead Bug", "Side Plank", "Bird Dog"] },
      { focus: "Functional Training - Power", exercises: ["Kettlebell Swing", "Med Ball Slam", "Jump Squat"] },
      { focus: "Functional Training - Agility", exercises: ["Ladder Drill", "Skater Hops", "Shuttle Runs"] },
    ],
    flexibility_mobility_workout: [
      { focus: "Flexibility / Mobility - Upper Body", exercises: ["Thoracic Rotations", "Band Stretch", "Shoulder CARs"] },
      { focus: "Flexibility / Mobility - Lower Body", exercises: ["Hip Openers", "Hamstring Stretch", "Ankle Mobility"] },
      { focus: "Flexibility / Mobility - Spine", exercises: ["Cat-Cow", "Child Pose", "Cobra Stretch"] },
      { focus: "Flexibility / Mobility - Flow", exercises: ["Sun Salutations", "Deep Squat Hold", "World's Greatest Stretch"] },
      { focus: "Flexibility / Mobility - Recovery", exercises: ["Foam Roll", "Breathing", "Gentle Stretch"] },
    ],
    hiit: [
      { focus: "HIIT - Cardio Blast", exercises: ["Sprint Intervals", "Jump Rope", "Burpees"] },
      { focus: "HIIT - Full Body", exercises: ["Mountain Climbers", "Thrusters", "Push-ups"] },
      { focus: "HIIT - Lower Body", exercises: ["Jump Squats", "Lunges", "High Knees"] },
      { focus: "HIIT - Core", exercises: ["Plank Jacks", "Russian Twist", "Bicycle Crunches"] },
      { focus: "HIIT - Conditioning", exercises: ["Battle Rope", "Row Sprints", "Box Steps"] },
    ],
    cardio: [
      { focus: "Cardio - Walk/Run", exercises: ["Brisk Walk", "Light Jog", "Cooldown Walk"] },
      { focus: "Cardio - Cycling", exercises: ["Steady Cycle", "Cadence Drill", "Recovery Spin"] },
      { focus: "Cardio - Rowing", exercises: ["Row Intervals", "Easy Row", "Stretch"] },
      { focus: "Cardio - Low Impact", exercises: ["Elliptical", "Incline Walk", "March in Place"] },
      { focus: "Cardio - Mixed Session", exercises: ["Step-ups", "Jump Rope", "Shadow Boxing"] },
    ],
  };

  const normalizedPreference = String(workoutPreference || "").toLowerCase();
  if (workoutTypeTemplates[normalizedPreference]) {
    return workoutTypeTemplates[normalizedPreference];
  }

  const normalized = String(level || "").toLowerCase();
  if (normalized === "advanced") return advanced;
  if (normalized === "intermediate") return intermediate;
  return beginner;
};

const buildWorkoutDays = ({ level, workoutPreference, workoutsPerWeek, progressAdjustment }) => {
  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const template = getWorkoutTemplate(level, workoutPreference);
  const targetWorkoutDays = Math.max(3, Math.min(6, Number(workoutsPerWeek || 5) + progressAdjustment));

  return dayNames.map((dayName, index) => {
    if (index < targetWorkoutDays) {
      const selected = template[index % template.length];
      return {
        dayName,
        focus: selected.focus,
        duration: level === "beginner" ? "35-45 min" : "45-60 min",
        exercises: selected.exercises.map((name) => ({
          name,
          sets: level === "beginner" ? 3 : 4,
          reps: level === "advanced" ? "6-10" : "8-12",
          rest: level === "advanced" ? "90 sec" : "60 sec",
          formGuide: "Controlled movement with proper form",
        })),
      };
    }

    return {
      dayName,
      focus: "Recovery",
      duration: "20-30 min",
      exercises: [
        {
          name: "Light Walk + Stretch",
          sets: 1,
          reps: "20 min",
          rest: "N/A",
          formGuide: "Keep intensity low, focus on recovery",
        },
      ],
    };
  });
};

export const generateAIPlan = (user, progressSummary = null) => {
  const baseCalories = Number(user.maintenanceCalories) || Number(user.calorieTarget) || 1800;
  const weight = Number(user.weight) || 60;
  const goal = user.goal || user.primaryGoal || "maintain";
  const level = String(user.experienceLevel || "beginner").toLowerCase();

  let targetCalories = Number(user.targetCalories) || baseCalories;
  const normalizedGoal = String(goal).toLowerCase();

  if (!user.targetCalories) {
    if (normalizedGoal.includes("weight") && normalizedGoal.includes("loss")) {
      targetCalories -= 350;
    } else if (normalizedGoal.includes("muscle") && normalizedGoal.includes("gain")) {
      targetCalories += 250;
    }
  }

  let workoutAdjustment = 0;
  let calorieAdjustment = 0;

  if (progressSummary) {
    if (progressSummary.avgHabitScore >= 80) {
      workoutAdjustment = 1;
      calorieAdjustment = normalizedGoal.includes("loss") ? -80 : 80;
    } else if (progressSummary.avgHabitScore < 50) {
      workoutAdjustment = -1;
      calorieAdjustment = normalizedGoal.includes("loss") ? 100 : 0;
    }

    if (progressSummary.avgDietAdherence < 45 && normalizedGoal.includes("loss")) {
      calorieAdjustment += 70;
    }
  }

  targetCalories = Math.max(1200, Math.round(targetCalories + calorieAdjustment));

  const ratio = getMacroDistribution(goal);
  const protein = Math.max(0, Math.round((targetCalories * ratio.protein) / 4));
  const carbs = Math.max(0, Math.round((targetCalories * ratio.carbs) / 4));
  const fats = Math.max(0, Math.round((targetCalories * ratio.fats) / 9));

  const macros = { protein, carbs, fats };
  const meals = buildMeals({
    calories: targetCalories,
    macros,
    foodPreference: user.foodPreference,
  });

  const workoutsPerWeek = user.workoutsPerWeek || 5;
  const workoutDays = buildWorkoutDays({
    level,
    workoutPreference: user.workoutPreference,
    workoutsPerWeek,
    progressAdjustment: workoutAdjustment,
  });

  return {
    calories: targetCalories,
    macros,
    meals,
    workoutDays,
    workoutLevel: user.experienceLevel || "Beginner",
    progressInsights: {
      avgWorkoutAdherence: progressSummary?.avgWorkoutAdherence || 0,
      avgDietAdherence: progressSummary?.avgDietAdherence || 0,
      avgHabitScore: progressSummary?.avgHabitScore || 0,
      planMode: progressSummary ? "progress_adaptive" : "adaptive_random",
    },
    generatedAt: new Date(),
  };
};

const parseJsonFromText = (text = "") => {
  const raw = String(text || "").trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    const fencedMatch = raw.match(/```json\s*([\s\S]*?)\s*```/i) || raw.match(/```\s*([\s\S]*?)\s*```/i);
    if (fencedMatch?.[1]) {
      try {
        return JSON.parse(fencedMatch[1].trim());
      } catch {
        return null;
      }
    }
  }

  return null;
};

const normalizePlanFromAI = (candidate, fallbackPlan) => {
  if (!candidate || typeof candidate !== "object") {
    return fallbackPlan;
  }

  const calories = Number(candidate.calories);
  const macros = {
    protein: Number(candidate?.macros?.protein),
    carbs: Number(candidate?.macros?.carbs),
    fats: Number(candidate?.macros?.fats),
  };

  const normalizedMeals = Array.isArray(candidate.meals)
    ? candidate.meals
        .map((meal) => ({
          mealName: String(meal?.mealName || "").trim(),
          time: String(meal?.time || "").trim(),
          calories: Number(meal?.calories),
          items: Array.isArray(meal?.items)
            ? meal.items.map((item) => String(item || "").trim()).filter(Boolean)
            : [],
          macros: {
            protein: Number(meal?.macros?.protein),
            carbs: Number(meal?.macros?.carbs),
            fats: Number(meal?.macros?.fats),
          },
        }))
        .filter((meal) => meal.mealName && meal.items.length > 0)
    : [];

  const normalizedWorkoutDays = Array.isArray(candidate.workoutDays)
    ? candidate.workoutDays
        .map((day) => ({
          dayName: String(day?.dayName || "").trim(),
          focus: String(day?.focus || "").trim(),
          duration: String(day?.duration || "").trim(),
          exercises: Array.isArray(day?.exercises)
            ? day.exercises
                .map((exercise) => ({
                  name: String(exercise?.name || "").trim(),
                  sets: Number(exercise?.sets) || 3,
                  reps: String(exercise?.reps || "8-12"),
                  rest: String(exercise?.rest || "60 sec"),
                  formGuide: String(
                    exercise?.formGuide || "Controlled movement with proper form",
                  ),
                }))
                .filter((exercise) => exercise.name)
            : [],
        }))
        .filter((day) => day.dayName && day.focus)
    : [];

  const validCalories = Number.isFinite(calories) && calories > 0;
  const validMacros =
    Number.isFinite(macros.protein) &&
    Number.isFinite(macros.carbs) &&
    Number.isFinite(macros.fats) &&
    macros.protein >= 0 &&
    macros.carbs >= 0 &&
    macros.fats >= 0;

  return {
    ...fallbackPlan,
    calories: validCalories ? Math.round(calories) : fallbackPlan.calories,
    macros: validMacros
      ? {
          protein: Math.round(macros.protein),
          carbs: Math.round(macros.carbs),
          fats: Math.round(macros.fats),
        }
      : fallbackPlan.macros,
    meals: normalizedMeals.length > 0 ? normalizedMeals : fallbackPlan.meals,
    workoutDays:
      normalizedWorkoutDays.length > 0 ? normalizedWorkoutDays : fallbackPlan.workoutDays,
    workoutLevel:
      String(candidate.workoutLevel || "").trim() || fallbackPlan.workoutLevel,
    progressInsights: {
      ...(fallbackPlan.progressInsights || {}),
      planMode: "ai_personalized",
    },
    generatedAt: new Date(),
  };
};

export const generatePersonalizedAIPlan = async (user, progressSummary = null) => {
  const fallbackPlan = generateAIPlan(user, progressSummary);

  try {
    const promptPayload = {
      profile: {
        age: user?.age,
        biologicalSex: user?.biologicalSex,
        height: user?.height,
        weight: user?.weight,
        goal: user?.goal || user?.primaryGoal,
        experienceLevel: user?.experienceLevel,
        foodPreference: user?.foodPreference,
        workoutPreference: user?.workoutPreference,
        activityLevel: user?.activityLevel,
        targetCalories: user?.targetCalories,
        calorieTarget: user?.calorieTarget,
        workoutsPerWeek: user?.workoutsPerWeek,
      },
      progressSummary,
    };

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      max_completion_tokens: 1400,
      messages: [
        {
          role: "system",
          content:
            "You are an expert fitness planning AI. Return ONLY valid JSON. Build a personalized 7-day diet + workout plan based on profile and progress. JSON shape: { calories:number, macros:{protein:number,carbs:number,fats:number}, meals:[{mealName:string,time:string,calories:number,items:string[],macros:{protein:number,carbs:number,fats:number}}], workoutLevel:string, workoutDays:[{dayName:string,focus:string,duration:string,exercises:[{name:string,sets:number,reps:string,rest:string,formGuide:string}]}] }",
        },
        {
          role: "user",
          content: JSON.stringify(promptPayload),
        },
      ],
    });

    const aiText = completion?.choices?.[0]?.message?.content || "";
    const aiJson = parseJsonFromText(aiText);
    const normalized = normalizePlanFromAI(aiJson, fallbackPlan);

    return {
      ...normalized,
      aiSource: "groq",
    };
  } catch {
    return {
      ...fallbackPlan,
      progressInsights: {
        ...(fallbackPlan.progressInsights || {}),
        planMode: "rule_fallback",
      },
      aiSource: "fallback",
    };
  }
};