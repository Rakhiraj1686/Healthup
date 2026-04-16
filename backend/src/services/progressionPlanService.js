import User from "../model/userProfileModel.js";

/**
 * Generate 4-8 week progression plan
 * Includes intensity increases, diet adjustments, and milestone markers
 */
export const generate8WeekPlan = async (userId, weeks = 8) => {
  try {
    const user = await User.findById(userId).select(
      "weight goal primaryGoal goalWeight aiPlan experienceLevel",
    );

    if (!user || !user.weight) {
      return { error: "Insufficient user data", plan: [] };
    }

    const currentWeight = Number(user.weight);
    const goalLabel = String(user.primaryGoal || user.goal || "maintain").toLowerCase();
    const configuredGoalWeight = Number(user.goalWeight);

    let targetWeight = Number.isFinite(configuredGoalWeight) ? configuredGoalWeight : null;
    if (!Number.isFinite(targetWeight)) {
      // Fallback target ensures UI output is always available even before explicit goal weight is configured.
      if (goalLabel.includes("loss")) {
        targetWeight = Number((currentWeight - 4).toFixed(1));
      } else if (goalLabel.includes("gain")) {
        targetWeight = Number((currentWeight + 3).toFixed(1));
      } else {
        targetWeight = currentWeight;
      }
    }

    const dietGoal = goalLabel;
    const experienceLevel = user.experienceLevel || "beginner";
    const currentCalories = user.aiPlan?.calories || 2000;
    const currentProtein = user.aiPlan?.macros?.protein || 150;
    const currentCarbs = user.aiPlan?.macros?.carbs || 200;
    const currentFats = user.aiPlan?.macros?.fats || 70;
    const workoutDaysPerWeek = user.aiPlan?.workoutDays || 4;

    const plan = [];

    // Calculate weekly weight change needed
    const totalWeightDifference = Math.abs(targetWeight - currentWeight);
    const weeklyChangeNeeded = totalWeightDifference / weeks;
    const isLosing = targetWeight < currentWeight;

    // Base intensity by experience level
    const intensityMap = {
      beginner: { baseWorkouts: 3, rpeStart: 5, increment: 0.3 },
      intermediate: { baseWorkouts: 4, rpeStart: 6, increment: 0.4 },
      advanced: { baseWorkouts: 5, rpeStart: 7, increment: 0.5 },
    };

    const baseConfig = intensityMap[experienceLevel] || intensityMap.intermediate;

    // Diet adjustment strategy
    const dietStrategy = isLosing ? "deficit" : "surplus";
    const calorieAdjPerWeek = dietStrategy === "deficit" ? -50 : 100; // calories/week
    const proteinAdjPerWeek = 5; // grams/week - increase for muscle retention

    for (let week = 1; week <= weeks; week++) {
      // Intensity progression
      const workoutsThisWeek = Math.min(
        baseConfig.baseWorkouts + Math.floor(week / 2),
        6
      ); // Planned intensity increase: every ~2 weeks workout frequency goes up (capped for safety)
      const durationMin = 45 + week * 2; // Planned intensity increase: session duration timeline (+2 min/week)
      const rpeLevel = (baseConfig.rpeStart + week * baseConfig.increment).toFixed(1); // Planned intensity increase: progressive RPE load by week
      const intensityPercent = ((Number(rpeLevel) / 10) * 100).toFixed(0);

      // Diet adjustments
      const adjustedCalories = Math.round(
        currentCalories + calorieAdjPerWeek * week
      ); // Diet adjustments timeline: calories are adjusted each week based on deficit/surplus strategy
      const adjustedProtein = Math.round(
        currentProtein + proteinAdjPerWeek * week
      ); // Diet adjustments timeline: protein is increased weekly for recovery/muscle retention
      // Keep carbs/fats in consistent ratio
      const macroRatio = (currentCarbs + currentFats) / currentCalories;
      const adjustedMacros = Math.round(adjustedCalories * macroRatio);
      const adjustedCarbs = Math.round(adjustedMacros * 0.65);
      const adjustedFats = Math.round(adjustedMacros * 0.35);

      // Projected weight
      const projectedWeight = (currentWeight - weeklyChangeNeeded * week).toFixed(1);

      // Milestone markers
      const milestones = [];
      if (week === 2) milestones.push("Habit Formation Week"); // Projected milestone marker: consistency checkpoint
      if (week === 4) milestones.push("First Assessment"); // Projected milestone marker: mid-cycle performance check
      if (week === 6) milestones.push("Plateau Watch"); // Projected milestone marker: stagnation detection window
      if (week === 8) milestones.push("Goal Review"); // Projected milestone marker: end-of-cycle review

      plan.push({
        week,
        intensity: {
          workoutsPerWeek: workoutsThisWeek,
          avgDurationMin: durationMin,
          rpeLevel: Number(rpeLevel),
          intensityPercent: Number(intensityPercent), // UI can plot week-wise intensity curve for 4-8 week preview
          description:
            week <= 2
              ? "Foundation Building"
              : week <= 4
                ? "Strength Increase"
                : week <= 6
                  ? "Peak Performance"
                  : "Recovery & Maintenance",
        },
        diet: {
          calories: adjustedCalories,
          protein: adjustedProtein,
          carbs: adjustedCarbs,
          fats: adjustedFats,
          adjustment:
            week === 1
              ? "Establishment"
              : Math.abs(calorieAdjPerWeek) > 0
                ? `${dietStrategy === "deficit" ? "-" : "+"}${Math.abs(calorieAdjPerWeek)} cal/week` // Diet adjustment timeline label per week
                : "Maintenance",
        },
        projection: {
          projectedWeight: Number(projectedWeight), // Projected milestone marker basis: expected weight at each week
          weeklyChange: weeklyChangeNeeded.toFixed(2),
          progress:
            ((Math.abs(currentWeight - Number(projectedWeight)) / totalWeightDifference) *
              100).toFixed(1) + "%",
        },
        milestones,
        status:
          week <= 2
            ? "starting"
            : week <= 4
              ? "progressing"
              : week <= 6
                ? "peak"
                : "final",
      });
    }

    return {
      userId,
      durationWeeks: weeks,
      dietGoal,
      experienceLevel,
      startingWeight: currentWeight,
      targetWeight,
      totalChange: totalWeightDifference.toFixed(1),
      weeklyChangeNeeded: weeklyChangeNeeded.toFixed(2),
      strategy: dietStrategy,
      plan,
    };
  } catch (error) {
    console.error("Error in generate8WeekPlan:", error);
    return { error: error.message, plan: [] };
  }
};

/**
 * Get week-specific recommendations
 */
export const getWeekRecommendations = async (userId, week) => {
  try {
    const fullPlan = await generate8WeekPlan(userId, 8);
    const weekPlan = fullPlan.plan?.[week - 1];

    if (!weekPlan) {
      return { error: "Week not found in plan" };
    }

    return {
      week,
      workoutTips: getWorkoutTips(week, fullPlan.experienceLevel),
      dietTips: getDietTips(week, fullPlan.strategy),
      motivationalMessage: getMotivationalMessage(week, fullPlan.durationWeeks),
      nextWeekPreview: week < fullPlan.durationWeeks ? fullPlan.plan[week] : null,
    };
  } catch (error) {
    console.error("Error in getWeekRecommendations:", error);
    return { error: error.message };
  }
};

const getWorkoutTips = (week, level) => {
  const tips = {
    1: "Focus on form over intensity. Light warm-up is key.",
    2: "Start tracking RPE (Rate of Perceived Exertion). Aim for consistency.",
    3: "Begin progressive overload. Increase weight or reps by 5%.",
    4: "Time to assess. Did you hit your workout goals?",
    5: "Push harder. You should feel stronger now.",
    6: "Peak week! Maintain intensity, avoid overtraining.",
    7: "Active recovery week. Light workouts help avoid burnout.",
    8: "Final assessments. Measure progress and plan next cycle.",
  };
  return tips[week] || "Continue with your plan.";
};

const getDietTips = (week, strategy) => {
  const deficitTips = {
    1: "Track baseline. No drastic changes yet.",
    2: "Small deficit started. Feel how your body responds.",
    3: "Increase water intake. Stay hydrated.",
    4: "Reassess hunger levels. Adjust if needed.",
    5: "Protein intake is critical now. Don't skip meals.",
    6: "Watch for diet fatigue. Add one treat meal if needed.",
    7: "Tighten up again. Final stretch for results.",
    8: "Assess weight loss. Plan next phase.",
  };

  const surplusTips = {
    1: "Establish eating pattern. Consistent meals are important.",
    2: "Increase calories smoothly. No sudden jumps.",
    3: "Monitor gains. Aim for 0.5 kg/week.",
    4: "Reassess progress. Adjust if gaining too fast.",
    5: "Protein helps muscle growth. Eat 2g per kg bodyweight.",
    6: "Stay consistent. Peak nutrition timing matters.",
    7: "Final push. Maintain surplus for muscle gains.",
    8: "Assess muscle gain. Time to cut or continue bulk.",
  };

  return strategy === "deficit" ? deficitTips[week] : surplusTips[week];
};

const getMotivationalMessage = (week, totalWeeks) => {
  const messages = {
    1: "💪 Starting strong! Every day counts.",
    2: "🔥 Building momentum. You've got this!",
    3: "📈 Seeing progress? Keep pushing!",
    4: "✅ Quarter done! Celebrate small wins.",
    5: "⚡ Peak mode activated. Stay focused.",
    6: "🏆 Almost there! Final push ahead.",
    7: "🎯 One week left. Don't give up now!",
    8: "🎉 Complete! Assess, celebrate, and plan next phase.",
  };
  return messages[week] || "Keep going!";
};
