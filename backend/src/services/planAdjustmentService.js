import DailyProgress from "../model/DailyProgress.js";
import User from "../model/userProfileModel.js";
import { getWeekKey, normalizeDate } from "../utils/progressUtils.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MIN_DATA_POINTS = 3;

const getSafeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const evaluateWeeklyProgress = async (userId) => {
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeek = await DailyProgress.find({
    user: userId,
    date: { $gte: sevenDaysAgo, $lte: today },
  }).select(
    "date weightKg workoutAdherencePercent dietAdherencePercent workoutsCompleted workoutsPlanned",
  );

  const prevWeek = await DailyProgress.find({
    user: userId,
    date: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
  }).select("date weightKg");

  if (thisWeek.length === 0) {
    return null;
  }

  // Extract first and last weight of each week
  const thisWeekWeights = thisWeek
    .filter((d) => Number.isFinite(d.weightKg))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const prevWeekWeights = prevWeek
    .filter((d) => Number.isFinite(d.weightKg))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const thisWeekStart = thisWeekWeights[0]?.weightKg;
  const thisWeekEnd = thisWeekWeights[thisWeekWeights.length - 1]?.weightKg;
  const prevWeekStart = prevWeekWeights[0]?.weightKg;
  const prevWeekEnd = prevWeekWeights[prevWeekWeights.length - 1]?.weightKg;

  const weeklyWeightChange =
    Number.isFinite(thisWeekStart) && Number.isFinite(thisWeekEnd)
      ? Number((thisWeekEnd - thisWeekStart).toFixed(2))
      : null;
  const avgAdherence = thisWeek.length
    ? thisWeek.reduce(
        (sum, d) => sum + getSafeNumber(d.dietAdherencePercent),
        0,
      ) / thisWeek.length
    : 0;

  const workoutCompletion = thisWeek.length
    ? thisWeek.reduce((sum, d) => sum + getSafeNumber(d.workoutsCompleted), 0) /
      Math.max(
        thisWeek.reduce((sum, d) => sum + getSafeNumber(d.workoutsPlanned), 0),
        1,
      )
    : 0;

  const avgWorkoutAdherence = thisWeek.length
    ? thisWeek.reduce(
        (sum, d) =>
          sum +
          getSafeNumber(
            d.workoutAdherencePercent,
            getSafeNumber(d.adherenceScore),
          ),
        0,
      ) / thisWeek.length
    : Number((workoutCompletion * 100).toFixed(2));

  return {
    weeklyWeightChange,
    avgAdherence: Number(avgAdherence.toFixed(2)),
    avgWorkoutAdherence: Number(avgWorkoutAdherence.toFixed(2)),
    workoutCompletion: Number((workoutCompletion * 100).toFixed(2)),
    dataPoints: thisWeek.length,
    hasHistoricalData: !!(prevWeekStart && prevWeekEnd),
    prevWeekWeightChange:
      prevWeekStart && prevWeekEnd ? prevWeekEnd - prevWeekStart : null,
  };
};

export const calculatePlanAdjustments = (weeklyMetrics, user) => {
  const defaultReturn = {
    adjustments: { calorieAdjust: 0, workoutAdjust: 0, triggers: [] },
    triggers: [],
  };

  if (!weeklyMetrics || weeklyMetrics.dataPoints < MIN_DATA_POINTS) {
    return defaultReturn;
  }

  const adjustments = [];
  const goal = String(
    user.goal || user.primaryGoal || "maintain",
  ).toLowerCase();
  const currentCalories =
    Number(user.targetCalories) || Number(user.calorieTarget) || 1800;
  const currentWorkouts = Number(user.workoutsPerWeek) || 5;

  // --- WEIGHT LOSS ADJUSTMENTS ---
  if (goal.includes("weight") && goal.includes("loss")) {
    if (weeklyMetrics.weeklyWeightChange === null) {
      adjustments.push({
        trigger: "no_weight_data",
        message: "Log weight regularly to enable plan adjustments",
        calorieAdjust: 0,
        workoutAdjust: 0,
      });
    } else if (weeklyMetrics.weeklyWeightChange < -1.0) {
      // Trigger #1 (Safety): weight loss > 1 kg/week => reduce deficit.
      adjustments.push({
        trigger: "excessive_loss",
        message:
          "Weight loss > 1 kg/week detected. Reducing calorie deficit for safety.",
        calorieAdjust: 150,
        workoutAdjust: 0,
      });
    } else if (
      weeklyMetrics.weeklyWeightChange < -0.3 &&
      weeklyMetrics.weeklyWeightChange >= -1.0
    ) {
      // Good progress, maintain
      adjustments.push({
        trigger: "optimal_loss",
        message: "Weight loss on track (0.3–1 kg/week). Keep current plan.",
        calorieAdjust: 0,
        workoutAdjust: 0,
      });
    } else if (
      weeklyMetrics.weeklyWeightChange >= -0.3 &&
      weeklyMetrics.weeklyWeightChange < 0
    ) {
      // Trigger #2: weight loss < 0.3 kg/week => slightly increase deficit.
      adjustments.push({
        trigger: "slow_loss",
        message: "Weight loss < 0.3 kg/week. Slightly increasing deficit.",
        calorieAdjust: -100,
        workoutAdjust: 0,
      });
    } else if (weeklyMetrics.weeklyWeightChange >= 0) {
      // No loss or gain, increase deficit more
      adjustments.push({
        trigger: "no_progress",
        message:
          "No weight loss detected. Increasing calorie deficit significantly.",
        calorieAdjust: -200,
        workoutAdjust: 1,
      });
    }
  }

  // --- MUSCLE GAIN ADJUSTMENTS ---
  if (goal.includes("muscle") && goal.includes("gain")) {
    if (weeklyMetrics.weeklyWeightChange === null) {
      adjustments.push({
        trigger: "no_weight_data",
        message: "Log weight regularly to monitor muscle gain progress",
        calorieAdjust: 0,
        workoutAdjust: 0,
      });
    } else if (weeklyMetrics.weeklyWeightChange > 0.5) {
      // Good muscle gain trend
      adjustments.push({
        trigger: "gaining",
        message: "Positive weight trend detected. Continue current plan.",
        calorieAdjust: 0,
        workoutAdjust: 0,
      });
    } else if (
      weeklyMetrics.weeklyWeightChange <= 0.1 &&
      weeklyMetrics.weeklyWeightChange >= 0
    ) {
      // Trigger #3: muscle gain stagnant => increase training volume.
      adjustments.push({
        trigger: "stagnant_gain",
        message: "Muscle gain stagnant. Increasing weekly volume.",
        calorieAdjust: 75,
        workoutAdjust: 1,
      });
    } else if (
      weeklyMetrics.weeklyWeightChange <= 0.5 &&
      weeklyMetrics.weeklyWeightChange > 0.1
    ) {
      adjustments.push({
        trigger: "slow_gain",
        message:
          "Muscle gain is slow but positive. Minor nutrition increase applied.",
        calorieAdjust: 100,
        workoutAdjust: 0,
      });
    } else {
      // Losing weight, increase calories
      adjustments.push({
        trigger: "losing_on_gain",
        message:
          "Weight loss during muscle gain phase. Increasing calorie surplus.",
        calorieAdjust: 250,
        workoutAdjust: 1,
      });
    }
  }

  // --- ADHERENCE-BASED ADJUSTMENTS ---
  if (
    weeklyMetrics.avgAdherence < 60 ||
    weeklyMetrics.avgWorkoutAdherence < 60
  ) {
    // Trigger #4: low adherence => simplify plan for better consistency.
    adjustments.push({
      trigger: "low_adherence",
      message:
        "Low adherence detected. Simplifying plan: fewer, easier workouts.",
      calorieAdjust: 0,
      workoutAdjust: -1,
      simplifyWorkouts: true,
    });
  } else if (
    weeklyMetrics.avgAdherence >= 80 &&
    weeklyMetrics.workoutCompletion >= 75
  ) {
    adjustments.push({
      trigger: "high_adherence",
      message:
        "Excellent adherence (≥ 80%)! Increasing intensity for faster results.",
      calorieAdjust: goal.includes("loss") ? -50 : 75,
      workoutAdjust: 1,
    });
  }

  // Consolidate adjustments
  const consolidated = {
    calorieAdjust: adjustments.reduce((sum, a) => sum + a.calorieAdjust, 0),
    workoutAdjust: adjustments.reduce((sum, a) => sum + a.workoutAdjust, 0),
    simplifyWorkouts: adjustments.some((a) => a.simplifyWorkouts),
    fromCalories: currentCalories,
    toCalories: Math.max(
      1200,
      Math.min(
        3500,
        currentCalories +
          adjustments.reduce((sum, a) => sum + a.calorieAdjust, 0),
      ),
    ),
    fromWorkoutsPerWeek: currentWorkouts,
    toWorkoutsPerWeek: Math.max(
      3,
      Math.min(
        7,
        currentWorkouts +
          adjustments.reduce((sum, a) => sum + a.workoutAdjust, 0),
      ),
    ),
    triggers: adjustments.map((a) => ({
      trigger: a.trigger,
      message: a.message,
    })),
  };

  return {
    adjustments: consolidated,
    triggers: consolidated.triggers,
  };
};

export const applyPlanAdjustments = (user, adjustments) => {
  if (
    !adjustments ||
    (!adjustments.calorieAdjust && !adjustments.workoutAdjust)
  ) {
    return user;
  }

  const updatedUser = user;

  // Adjust calories (with safety bounds)
  if (adjustments.calorieAdjust !== 0) {
    const currentCalories =
      Number(updatedUser.targetCalories) ||
      Number(updatedUser.calorieTarget) ||
      1800;
    updatedUser.targetCalories = Math.max(
      1200,
      Math.min(3500, currentCalories + adjustments.calorieAdjust),
    );
  }

  // Adjust workouts (with safety bounds)
  if (adjustments.workoutAdjust !== 0) {
    const currentWorkouts = Number(updatedUser.workoutsPerWeek) || 5;
    updatedUser.workoutsPerWeek = Math.max(
      3,
      Math.min(7, currentWorkouts + adjustments.workoutAdjust),
    );
  }

  updatedUser.lastPlanAdjustment = {
    appliedAt: new Date(),
    adjustments,
    triggers: adjustments.triggers || [],
    simplifyWorkouts: adjustments.simplifyWorkouts || false,
  };

  return updatedUser;
};

export const generateAIWeeklyPlan = async (user, weeklyMetrics, adjustments) => {
  const prompt = `
User Goal: ${user.goal}

Updated Plan:
Target Calories: ${adjustments.toCalories}
Workouts Per Week: ${adjustments.toWorkoutsPerWeek}

Weekly Progress:
Weight Change: ${weeklyMetrics.weeklyWeightChange} kg
Diet Adherence: ${weeklyMetrics.avgAdherence}%
Workout Adherence: ${weeklyMetrics.avgWorkoutAdherence}%

Create a simple weekly fitness plan including:

1. Diet advice
2. Workout schedule
3. Health tips
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.log("AI plan generation failed:", error.message);
    return null;
  }
};

export const runWeeklyPlanAdjustmentForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return { updated: false, reason: "user_not_found" };
  }

  // Do not run automation repeatedly within the same calendar week.
  const thisWeekKey = getWeekKey(normalizeDate(new Date()));
  const alreadyAdjustedThisWeek =
    user.lastPlanAdjustment?.weekKey === thisWeekKey;
  if (alreadyAdjustedThisWeek) {
    return { updated: false, reason: "already_adjusted_this_week" };
  }

  const weeklyMetrics = await evaluateWeeklyProgress(userId);
  if (!weeklyMetrics || weeklyMetrics.dataPoints < MIN_DATA_POINTS) {
    return { updated: false, reason: "insufficient_data", weeklyMetrics };
  }

  const adjustmentResult = calculatePlanAdjustments(weeklyMetrics, user);
  const hasEffectiveChange =
    adjustmentResult.adjustments &&
    (adjustmentResult.adjustments.calorieAdjust !== 0 ||
      adjustmentResult.adjustments.workoutAdjust !== 0);

  if (!hasEffectiveChange) {
    user.lastPlanAdjustment = {
      appliedAt: new Date(),
      weekKey: thisWeekKey,
      automated: true,
      skipped: true,
      reason: "no_changes_needed",
      weeklyMetrics,
      triggers: adjustmentResult.triggers || [],
      adjustments: adjustmentResult.adjustments,
    };
    await user.save();
    return {
      updated: false,
      reason: "no_changes_needed",
      weeklyMetrics,
      adjustmentResult,
    };
  }

  const adjustedUser = applyPlanAdjustments(user, adjustmentResult.adjustments);
  adjustedUser.lastPlanAdjustment = {
    ...(adjustedUser.lastPlanAdjustment || {}),
    weekKey: thisWeekKey,
    automated: true,
    skipped: false,
    weeklyMetrics,
    triggers: adjustmentResult.triggers || [],
    adjustments: adjustmentResult.adjustments,
  };

  await adjustedUser.save();

  const aiPlan = await generateAIWeeklyPlan(
  adjustedUser,
  weeklyMetrics,
  adjustmentResult.adjustments
);

if (aiPlan) {
  adjustedUser.aiWeeklyPlan = aiPlan;
  await adjustedUser.save();
}

  return {
    updated: true,
    weeklyMetrics,
    adjustmentResult,
    user: adjustedUser,
  };
};

