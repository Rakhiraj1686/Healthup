import DailyProgress from "../model/DailyProgress.js";
import WorkoutLog from "../model/WorkoutLog.js";
import User from "../model/userProfileModel.js";
import { getWeekKey, normalizeDate } from "../utils/progressUtils.js";

/**
 * Multi-week habit trends
 * Returns daily adherence scores aggregated by week
 */
export const getMultiWeekHabitTrends = async (userId, weeks = 8) => {
  const startDate = normalizeDate(new Date(Date.now() - weeks * 7 * 86400000));

  const data = await DailyProgress.find({
    user: userId,
    date: { $gte: startDate },
  })
    .sort({ date: 1 })
    .select("date weekKey adherenceScore energyLevel workoutsCompleted dietAdherencePercent");

  // Group by week
  const weeklyData = {};
  data.forEach((record) => {
    const week = record.weekKey;
    if (!weeklyData[week]) {
      weeklyData[week] = {
        week,
        dates: [],
        adherenceScores: [],
        energyLevels: [],
        workoutDays: 0,
        dietAdherenceAvg: 0,
      };
    }
    weeklyData[week].dates.push(record.date);
    weeklyData[week].adherenceScores.push(record.adherenceScore || 0);
    weeklyData[week].energyLevels.push(record.energyLevel || "normal");
    if (record.workoutsCompleted > 0) weeklyData[week].workoutDays += 1;
    weeklyData[week].dietAdherenceAvg += record.dietAdherencePercent || 0;
  });

  // Calculate aggregates
  const trends = Object.values(weeklyData).map((week) => ({
    week: week.week,
    avgAdherence: week.adherenceScores.length
      ? (week.adherenceScores.reduce((a, b) => a + b, 0) / week.adherenceScores.length).toFixed(1)
      : 0,
    habitConsistency: // Multi-week habit trend consistency (% days logged in that week)
      week.dates.length > 0 ? ((week.dates.length / 7) * 100).toFixed(1) : 0, // % of days logged
    workoutDaysCompleted: week.workoutDays,
    avgDietAdherence:
      week.dietAdherenceAvg > 0 ? (week.dietAdherenceAvg / week.dates.length).toFixed(1) : 0,
    dominantEnergyLevel:
      week.energyLevels.length > 0
        ? week.energyLevels.sort((a, b) => week.energyLevels.filter((x) => x === a).length - week.energyLevels.filter((x) => x === b).length)[
            week.energyLevels.length - 1
          ]
        : "unknown",
  }));

  return trends;
};

/**
 * Progress velocity analysis
 * Calculate rate of change for weight, adherence, completion
 */
export const getProgressVelocityAnalysis = async (userId, weeks = 4) => {
  const startDate = normalizeDate(new Date(Date.now() - weeks * 7 * 86400000));

  const data = await DailyProgress.find({
    user: userId,
    date: { $gte: startDate },
    weekKey: { $exists: true },
  })
    .sort({ date: 1 })
    .select("date weekKey weightKg adherenceScore workoutCompletionRate");

  // Group by week
  const weeklyMetrics = {};
  data.forEach((record) => {
    const week = record.weekKey;
    if (!weeklyMetrics[week]) {
      weeklyMetrics[week] = {
        weights: [],
        adherences: [],
      };
    }
    if (record.weightKg) weeklyMetrics[week].weights.push(record.weightKg);
    if (record.adherenceScore) weeklyMetrics[week].adherences.push(record.adherenceScore);
  });

  // Calculate velocity for each week
  const weekKeys = Object.keys(weeklyMetrics).sort();
  const velocities = [];

  for (let i = 0; i < weekKeys.length; i++) {
    const week = weekKeys[i];
    const weekData = weeklyMetrics[week];

    const avgWeight =
      weekData.weights.length > 0
        ? (weekData.weights.reduce((a, b) => a + b, 0) / weekData.weights.length).toFixed(2)
        : null;
    const avgAdherence =
      weekData.adherences.length > 0
        ? (weekData.adherences.reduce((a, b) => a + b, 0) / weekData.adherences.length).toFixed(1)
        : null;

    velocities.push({
      week,
      avgWeight: Number(avgWeight) || null,
      avgAdherence: Number(avgAdherence) || null,
    });
  }

  // Calculate rate of change
  const analysis = [];
  for (let i = 1; i < velocities.length; i++) {
    const prev = velocities[i - 1];
    const current = velocities[i];

    const weightVelocity =
      prev.avgWeight && current.avgWeight
        ? (current.avgWeight - prev.avgWeight).toFixed(2)
        : null;
    const adherenceVelocity =
      prev.avgAdherence && current.avgAdherence
        ? (current.avgAdherence - prev.avgAdherence).toFixed(1)
        : null;

    analysis.push({
      week: current.week,
      weightVelocity: Number(weightVelocity) || null, // Progress velocity analysis: weekly weight change (kg/week)
      adherenceVelocity: Number(adherenceVelocity) || null, // Progress velocity analysis: adherence momentum (%/week)
      trend:
        weightVelocity < 0
          ? "decreasing"
          : weightVelocity > 0
            ? "increasing"
            : "stable",
    });
  }

  return analysis;
};

/**
 * Workout volume progression graph
 * Track frequency and aggregate duration over weeks
 */
export const getWorkoutVolumeProgression = async (userId, weeks = 8) => {
  const startDate = normalizeDate(new Date(Date.now() - weeks * 7 * 86400000));

  const logs = await WorkoutLog.find({
    user: userId,
    scheduledDate: { $gte: startDate },
  })
    .sort({ scheduledDate: 1 })
    .select("scheduledDate status durationMin");

  // Group by week
  const weeklyVolume = {};
  logs.forEach((log) => {
    const weekKey = getWeekKey(log.scheduledDate);
    if (!weeklyVolume[weekKey]) {
      weeklyVolume[weekKey] = {
        week: weekKey,
        completedCount: 0,
        totalDurationMin: 0,
        missedCount: 0,
        avgDurationPerWorkout: 0,
      };
    }

    if (log.status === "completed") {
      weeklyVolume[weekKey].completedCount += 1;
      weeklyVolume[weekKey].totalDurationMin += log.durationMin || 0;
    } else if (log.status === "missed") {
      weeklyVolume[weekKey].missedCount += 1;
    }
  });

  // Calculate averages
  const progression = Object.values(weeklyVolume).map((week) => ({
    week: week.week,
    workoutsCompleted: week.completedCount, // Workout volume progression graph: training frequency per week
    workoutsMissed: week.missedCount,
    totalDurationMin: week.totalDurationMin, // Workout volume progression graph: total training minutes per week
    avgDurationPerWorkout:
      week.completedCount > 0
        ? (week.totalDurationMin / week.completedCount).toFixed(1)
        : 0,
    completionRate:
      week.completedCount + week.missedCount > 0
        ? ((week.completedCount / (week.completedCount + week.missedCount)) * 100).toFixed(1)
        : 0,
  }));

  return progression;
};

/**
 * Diet macro accuracy tracking
 * Compare planned macros vs actual logged macros
 */
export const getDietMacroAccuracy = async (userId, weeks = 8) => {
  try {
    const startDate = normalizeDate(new Date(Date.now() - weeks * 7 * 86400000));

    const dailyData = await DailyProgress.find({
      user: userId,
      date: { $gte: startDate },
    })
      .sort({ date: 1 })
      .select("date weekKey proteinG caloriesIn dietAdherencePercent");

    // Get user's AI plan for target macros
    const user = await User.findById(userId).select("aiPlan");
    const targetProtein = user?.aiPlan?.macros?.protein || 150;
    const targetCalories = user?.aiPlan?.calories || 2000;

  // Group by week
  const weeklyData = {};
  dailyData.forEach((record) => {
    const week = record.weekKey;
    if (!weeklyData[week]) {
      weeklyData[week] = {
        week,
        proteinLogs: [],
        caloriesLogs: [],
        dietAdherenceScores: [],
      };
    }
    if (record.proteinG) weeklyData[week].proteinLogs.push(record.proteinG);
    if (record.caloriesIn) weeklyData[week].caloriesLogs.push(record.caloriesIn);
    if (record.dietAdherencePercent) weeklyData[week].dietAdherenceScores.push(record.dietAdherencePercent);
  });

  // Calculate accuracy
  const accuracy = Object.values(weeklyData).map((week) => {
    const avgProtein = week.proteinLogs.length > 0 ? week.proteinLogs.reduce((a, b) => a + b, 0) / week.proteinLogs.length : 0;
    const avgCalories = week.caloriesLogs.length > 0 ? week.caloriesLogs.reduce((a, b) => a + b, 0) / week.caloriesLogs.length : 0;
    const avgAdherence = week.dietAdherenceScores.length > 0 ? week.dietAdherenceScores.reduce((a, b) => a + b, 0) / week.dietAdherenceScores.length : 0;

    const proteinAccuracy = targetProtein > 0 ? ((avgProtein / targetProtein) * 100).toFixed(1) : 0;
    const calorieAccuracy = targetCalories > 0 ? ((avgCalories / targetCalories) * 100).toFixed(1) : 0;

    return {
      week: week.week,
      avgProteinLogged: avgProtein.toFixed(1),
      targetProtein,
      proteinAccuracy: Number(proteinAccuracy), // Diet macro accuracy tracking: actual protein vs target protein
      avgCaloriesLogged: avgCalories.toFixed(0),
      targetCalories,
      calorieAccuracy: Number(calorieAccuracy), // Diet macro accuracy tracking: actual calories vs target calories
      dietAdherenceScore: avgAdherence.toFixed(1),
    };
  });

  return accuracy;
  } catch (error) {
    console.error("Error in getDietMacroAccuracy:", error);
    return [];
  }
};

/**
 * Multi-week roadmap preview
 * Project goal achievement date based on current velocity
 */
export const getMultiWeekRoadmap = async (userId) => {
  try {
    const user = await User.findById(userId).select("goal weight");

    const goal = user?.goal;
    const currentWeight = user?.weight;
    const targetWeight = goal?.targetWeight;

    if (!currentWeight || !targetWeight) {
      return {
        currentWeight: currentWeight || 0,
        targetWeight: targetWeight || 0,
        weeklyVelocity: 0,
        projectedWeeksToGoal: 0,
        roadmap: [],
      };
    }

  // Get last 4 weeks of data
  const fourWeeksAgo = normalizeDate(new Date(Date.now() - 28 * 86400000));
  const data = await DailyProgress.find({
    user: userId,
    date: { $gte: fourWeeksAgo },
    weightKg: { $exists: true },
  })
    .sort({ date: 1 })
    .select("date weekKey weightKg");

  // Group by week and calculate average
  const weeklyWeights = {};
  data.forEach((record) => {
    const week = record.weekKey;
    if (!weeklyWeights[week]) {
      weeklyWeights[week] = [];
    }
    weeklyWeights[week].push({
      date: record.date,
      weight: record.weightKg,
    });
  });

  const weekKeys = Object.keys(weeklyWeights).sort();
  const weightTrend = weekKeys.map((week) => {
    const weights = weeklyWeights[week].map((d) => d.weight);
    const avgWeight =
      weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : null;
    return { week, avgWeight };
  });

  // Calculate velocity (avg change per week)
  let totalWeightChange = 0;
  let velocityWeeks = 0;

  for (let i = 1; i < weightTrend.length; i++) {
    if (weightTrend[i].avgWeight && weightTrend[i - 1].avgWeight) {
      totalWeightChange += weightTrend[i].avgWeight - weightTrend[i - 1].avgWeight;
      velocityWeeks += 1;
    }
  }

  const weeklyVelocity = velocityWeeks > 0 ? totalWeightChange / velocityWeeks : 0;

  // Project weeks to goal
  const weightDifference = targetWeight - currentWeight;
  let projectedWeeks = 0;

  if (Math.abs(weeklyVelocity) > 0.01) {
    projectedWeeks = Math.ceil(Math.abs(weightDifference / weeklyVelocity));
  }

  // Generate roadmap with milestones
  const roadmap = [];
  const milestoneDays = [7, 14, 21, 28, 56]; // 1, 2, 3, 4, 8 weeks

  milestoneDays.forEach((days) => {
    if (days <= projectedWeeks * 7) {
      const projectedWeight = currentWeight + (weeklyVelocity * days) / 7;
      roadmap.push({
        week: Math.ceil(days / 7),
        daysFromNow: days,
        projectedWeight: projectedWeight.toFixed(1),
        weightToLose: (targetWeight - projectedWeight).toFixed(1),
        status: projectedWeight <= targetWeight ? "achieved" : "in-progress",
      });
    }
  });

  // Add final goal milestone
  roadmap.push({
    week: Math.ceil(projectedWeeks),
    daysFromNow: projectedWeeks * 7,
    projectedWeight: targetWeight.toFixed(1),
    weightToLose: "0.0",
    status: "goal",
  });

  return {
    currentWeight: currentWeight.toFixed(1),
    targetWeight: targetWeight.toFixed(1),
    weeklyVelocity: weeklyVelocity.toFixed(2),
    projectedWeeksToGoal: projectedWeeks,
    roadmap,
  };
  } catch (error) {
    console.error("Error in getMultiWeekRoadmap:", error);
    return {
      currentWeight: 0,
      targetWeight: 0,
      weeklyVelocity: 0,
      projectedWeeksToGoal: 0,
      roadmap: [],
    };
  }
};

/**
 * Get all advanced analytics
 */
export const getAllAdvancedAnalytics = async (userId, weeks = 8) => {
  try {
    const [habitTrends, velocityAnalysis, workoutProgression, macroAccuracy, roadmap] =
      await Promise.all([
        getMultiWeekHabitTrends(userId, weeks),
        getProgressVelocityAnalysis(userId, 4),
        getWorkoutVolumeProgression(userId, weeks),
        getDietMacroAccuracy(userId, weeks),
        getMultiWeekRoadmap(userId),
      ]);

    return {
      habitTrends, // 1) Multi-week habit trends
      velocityAnalysis, // 2) Progress velocity analysis
      workoutProgression, // 3) Workout volume progression graph data
      macroAccuracy, // 4) Diet macro accuracy tracking
      roadmap,
    };
  } catch (error) {
    console.error("Error in getAllAdvancedAnalytics:", error);
    return {
      habitTrends: [],
      velocityAnalysis: [],
      workoutProgression: [],
      macroAccuracy: [],
      roadmap: {},
    };
  }
};
