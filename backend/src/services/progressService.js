import DailyProgress from "../model/DailyProgress.js";
import WorkoutLog from "../model/WorkoutLog.js";
import StreakState from "../model/StreakState.js";
import ProgressAggregate from "../model/ProgressAggregate.js";
import AllInsight from "../model/AllInsight.js";
import { UserBadge } from "../model/Badge.js";
import User from "../model/userProfileModel.js";
import {
  clampPercent,
  normalizeDate,
  getWeekKey,
  getMonthKey,
  daysBetween,
  calculateGoalProgressPercent,
  detectPlateau,
} from "../utils/progressUtils.js";

const BADGE_CODES = {
  STREAK_7: "STREAK_7",
  STREAK_30: "STREAK_30",
  CONSISTENT_4_WEEKS: "CONSISTENT_4_WEEKS",
};

const evaluateAdherence = ({
  workoutsPlanned = 0,
  workoutsCompleted = 0,
  dietAdherencePercent = 0,
  habitAdherencePercent = 0,
}) => {
  const workoutAdherence = workoutsPlanned
    ? clampPercent((workoutsCompleted / workoutsPlanned) * 100)
    : 0;
  return clampPercent(
    workoutAdherence * 0.5 +
      Number(dietAdherencePercent || 0) * 0.25 +
      Number(habitAdherencePercent || 0) * 0.25,
  );
};

const ensureBadge = async (userId, badgeCode) => {
  await UserBadge.updateOne(
    { user: userId, badgeCode },
    { $setOnInsert: { earnedAt: new Date() } },
    { upsert: true },
  );
};

export const logWeight = async ({ userId, date, timezone, goalType, weightKg }) => {
  const normalizedDate = normalizeDate(date);

  const progress = await DailyProgress.findOneAndUpdate(
    { user: userId, date: normalizedDate },
    {
      $set: {
        timezone: timezone || "UTC",
        goalType: goalType || "maintenance",
        weightKg: Number(weightKg),
        weekKey: getWeekKey(normalizedDate),
        monthKey: getMonthKey(normalizedDate),
      },
      $setOnInsert: {
        workoutsPlanned: 0,
        workoutsCompleted: 0,
      },
    },
    { new: true, upsert: true, runValidators: true },
  );

  return progress;
};

export const logDailyCheckIn = async ({
  userId,
  date,
  timezone,
  caloriesIn,
  proteinG,
  steps,
  dietAdherencePercent,
  habitAdherencePercent,
  energyLevel,
  waistCm,
  chestCm,
  hipsCm,
  armsCm,
  thighsCm,
}) => {
  const normalizedDate = normalizeDate(date || new Date());

  const updateSet = {
    timezone: timezone || "UTC",
    weekKey: getWeekKey(normalizedDate),
    monthKey: getMonthKey(normalizedDate),
  };

  if (caloriesIn !== undefined && caloriesIn !== null && caloriesIn !== "") {
    updateSet.caloriesIn = Number(caloriesIn);
  }
  if (proteinG !== undefined && proteinG !== null && proteinG !== "") {
    updateSet.proteinG = Number(proteinG);
  }
  if (steps !== undefined && steps !== null && steps !== "") {
    updateSet.steps = Number(steps);
  }
  if (
    dietAdherencePercent !== undefined &&
    dietAdherencePercent !== null &&
    dietAdherencePercent !== ""
  ) {
    updateSet.dietAdherencePercent = Number(dietAdherencePercent);
  }
  if (
    habitAdherencePercent !== undefined &&
    habitAdherencePercent !== null &&
    habitAdherencePercent !== ""
  ) {
    updateSet.habitAdherencePercent = Number(habitAdherencePercent);
  }
  if (energyLevel) {
    updateSet.energyLevel = energyLevel;
  }

  const setIfPresent = (key, value) => {
    if (value !== undefined && value !== null && value !== "") {
      updateSet[key] = Number(value);
    }
  };

  setIfPresent("waistCm", waistCm);
  setIfPresent("chestCm", chestCm);
  setIfPresent("hipsCm", hipsCm);
  setIfPresent("armsCm", armsCm);
  setIfPresent("thighsCm", thighsCm);

  const updatedDaily = await DailyProgress.findOneAndUpdate(
    { user: userId, date: normalizedDate },
    {
      $set: updateSet,
      $setOnInsert: {
        workoutsPlanned: 0,
        workoutsCompleted: 0,
      },
    },
    { new: true, upsert: true, runValidators: true },
  );

  updatedDaily.adherenceScore = evaluateAdherence({
    workoutsPlanned: updatedDaily.workoutsPlanned,
    workoutsCompleted: updatedDaily.workoutsCompleted,
    dietAdherencePercent: updatedDaily.dietAdherencePercent,
    habitAdherencePercent: updatedDaily.habitAdherencePercent,
  });
  await updatedDaily.save();

  await recomputeProgressAggregates(
    userId,
    getWeekKey(normalizedDate),
    getMonthKey(normalizedDate),
  );

  return updatedDaily;
};

export const trackWorkoutCompletion = async ({
  userId,
  planWorkoutId,
  scheduledDate,
  status,
  durationMin,
  effortRpe,
}) => {
  const day = normalizeDate(scheduledDate || new Date());
  const workoutStatus = status || "completed";

  const workoutLog = await WorkoutLog.create({
    user: userId,
    planWorkoutId: planWorkoutId || `manual-${Date.now()}`,
    scheduledDate: day,
    status: workoutStatus,
    durationMin,
    effortRpe,
    completedAt: workoutStatus === "completed" ? new Date() : null,
  });

  const plannedIncrement = 1;
  const completedIncrement = workoutStatus === "completed" ? 1 : 0;

  const updatedDaily = await DailyProgress.findOneAndUpdate(
    { user: userId, date: day },
    {
      $setOnInsert: {
        weekKey: getWeekKey(day),
        monthKey: getMonthKey(day),
      },
      $inc: {
        workoutsPlanned: plannedIncrement,
        workoutsCompleted: completedIncrement,
      },
    },
    { new: true, upsert: true },
  );

  updatedDaily.adherenceScore = evaluateAdherence({
    workoutsPlanned: updatedDaily.workoutsPlanned,
    workoutsCompleted: updatedDaily.workoutsCompleted,
    dietAdherencePercent: updatedDaily.dietAdherencePercent,
    habitAdherencePercent: updatedDaily.habitAdherencePercent,
  });
  await updatedDaily.save();

  const streak = await recomputeStreak(userId, day, workoutStatus);
  await recomputeProgressAggregates(userId, getWeekKey(day), getMonthKey(day));

  return {
    workoutLog,
    streak,
    daily: updatedDaily,
  };
};

export const recomputeStreak = async (userId, activityDate, workoutStatus) => {
  let streak = await StreakState.findOne({ user: userId });
  if (!streak) {
    streak = await StreakState.create({ user: userId });
  }

  const isCompletedWorkout = workoutStatus === "completed";

  if (!isCompletedWorkout) {
    if (streak.freezeTokens > 0) {
      streak.freezeTokens -= 1;
    } else {
      streak.currentStreakDays = 0;
    }
    await streak.save();
    return streak;
  }

  if (!streak.lastActiveDate) {
    streak.currentStreakDays = 1;
  } else {
    const diffDays = daysBetween(streak.lastActiveDate, activityDate);

    if (diffDays <= 1) {
      streak.currentStreakDays += 1;
    } else {
      streak.currentStreakDays = 1;
    }
  }

  streak.lastActiveDate = activityDate;
  streak.longestStreakDays = Math.max(
    streak.longestStreakDays,
    streak.currentStreakDays,
  );

  await streak.save();

  if (streak.currentStreakDays >= 7) {
    await ensureBadge(userId, BADGE_CODES.STREAK_7);
  }
  if (streak.currentStreakDays >= 30) {
    await ensureBadge(userId, BADGE_CODES.STREAK_30);
  }

  return streak;
};

export const getStreak = async (userId) => {
  const streak = await StreakState.findOne({ user: userId });
  return (
    streak || {
      currentStreakDays: 0,
      longestStreakDays: 0,
      freezeTokens: 0,
      lastActiveDate: null,
    }
  );
};

const getLatestWeight = async (userId) => {
  const latest = await DailyProgress.findOne({ user: userId, weightKg: { $exists: true } })
    .sort({ date: -1 })
    .select("weightKg");

  return latest?.weightKg ?? null;
};

export const getGoalProgress = async (userId) => {
  const user = await User.findById(userId).select("weight primaryGoal goalWeight calorieTarget workoutsPerWeek");
  const currentWeight = await getLatestWeight(userId);

  const startWeight = Number(user?.weight);
  const goalWeight = Number(user?.goalWeight);

  let goalType = "maintenance";
  if (user?.primaryGoal === "weight loss") {
    goalType = "weight_loss";
  } else if (user?.primaryGoal === "muscle gain") {
    goalType = "muscle_gain";
  }

  const progressPercent = calculateGoalProgressPercent({
    goalType,
    startWeight,
    targetWeight: goalWeight,
    currentWeight: Number(currentWeight),
  });

  return {
    goalType,
    startWeight,
    currentWeight,
    targetWeight: goalWeight,
    progressPercent: Number(progressPercent.toFixed(2)),
    calorieTarget: user?.calorieTarget || 2000,
    workoutsPerWeek: user?.workoutsPerWeek || 5,
  };
};

export const getWeightHistory = async (userId, days = 90) => {
  const startDate = normalizeDate(new Date(Date.now() - Number(days) * 86400000));

  const rows = await DailyProgress.find({
    user: userId,
    date: { $gte: startDate },
    weightKg: { $exists: true },
  })
    .sort({ date: 1 })
    .select("date weightKg weekKey monthKey");

  return rows;
};

export const generateRuleBasedInsight = async (userId) => {
  const latestWeek = getWeekKey(new Date());
  const weekRows = await DailyProgress.find({ user: userId, weekKey: latestWeek })
    .sort({ date: 1 })
    .select("date workoutsPlanned workoutsCompleted adherenceScore weightKg");

  const completionTotal = weekRows.reduce(
    (acc, row) => {
      acc.planned += row.workoutsPlanned || 0;
      acc.completed += row.workoutsCompleted || 0;
      return acc;
    },
    { planned: 0, completed: 0 },
  );

  const completionRate = completionTotal.planned
    ? (completionTotal.completed / completionTotal.planned) * 100
    : 0;

  const weightSeries = weekRows
    .filter((item) => typeof item.weightKg === "number")
    .map((item) => item.weightKg);

  const plateauSignal = detectPlateau(weightSeries);
  const riskFlags = [];

  if (completionRate < 50) riskFlags.push("low_adherence");
  if (plateauSignal.plateau) riskFlags.push("plateau_risk");

  const summaryParts = [];
  summaryParts.push(`Workout completion is ${completionRate.toFixed(0)}% this week.`);

  if (plateauSignal.plateau) {
    summaryParts.push("Weight trend is flat; consider macro adjustment or training intensity tweak.");
  } else {
    summaryParts.push("Weight trend is showing healthy movement.");
  }

  if (completionRate >= 70) {
    summaryParts.push("Consistency is strong—keep current plan for another week.");
  }

  const summary = summaryParts.join(" ");

  const insight = await AllInsight .findOneAndUpdate(
    { user: userId, weekKey: latestWeek },
    {
      $set: {
        summary,
        riskFlags,
        confidence: 0.72,
        modelVersion: "rule-based-v1",
      },
    },
    { new: true, upsert: true },
  );

  return insight;
};

export const getLatestInsight = async (userId) => {
  const latestInsight = await AllInsight.findOne({ user: userId }).sort({ createdAt: -1 });

  if (latestInsight) return latestInsight;

  return generateRuleBasedInsight(userId);
};

export const recomputeProgressAggregates = async (userId, weekKey, monthKey) => {
  const [weeklyRows, monthlyRows, goalProgress] = await Promise.all([
    DailyProgress.find({ user: userId, weekKey }).select("weightKg workoutsPlanned workoutsCompleted adherenceScore"),
    DailyProgress.find({ user: userId, monthKey }).select("weightKg workoutsPlanned workoutsCompleted adherenceScore"),
    getGoalProgress(userId),
  ]);

  const buildAggregate = (rows) => {
    const weights = rows
      .filter((row) => typeof row.weightKg === "number")
      .map((row) => row.weightKg);

    const totalPlanned = rows.reduce((sum, row) => sum + (row.workoutsPlanned || 0), 0);
    const totalCompleted = rows.reduce((sum, row) => sum + (row.workoutsCompleted || 0), 0);
    const completionRate = totalPlanned
      ? clampPercent((totalCompleted / totalPlanned) * 100)
      : 0;

    const adherenceAvg = rows.length
      ? clampPercent(rows.reduce((sum, row) => sum + (row.adherenceScore || 0), 0) / rows.length)
      : 0;

    const avgWeightKg = weights.length
      ? weights.reduce((sum, value) => sum + value, 0) / weights.length
      : null;

    return {
      avgWeightKg,
      workoutCompletionRate: Number(completionRate.toFixed(2)),
      adherenceAvg: Number(adherenceAvg.toFixed(2)),
      goalProgressPercent: Number(goalProgress.progressPercent.toFixed(2)),
    };
  };

  const weeklyAggregate = buildAggregate(weeklyRows);
  const monthlyAggregate = buildAggregate(monthlyRows);

  await Promise.all([
    ProgressAggregate.findOneAndUpdate(
      { user: userId, periodType: "weekly", periodKey: weekKey },
      { $set: weeklyAggregate },
      { upsert: true, new: true },
    ),
    ProgressAggregate.findOneAndUpdate(
      { user: userId, periodType: "monthly", periodKey: monthKey },
      { $set: monthlyAggregate },
      { upsert: true, new: true },
    ),
  ]);

  if (weeklyAggregate.workoutCompletionRate >= 75) {
    await ensureBadge(userId, BADGE_CODES.CONSISTENT_4_WEEKS);
  }

  return { weeklyAggregate, monthlyAggregate };
};

export const getWeeklyAnalytics = async (userId, limit = 8) => {
  return ProgressAggregate.find({ user: userId, periodType: "weekly" })
    .sort({ periodKey: -1 })
    .limit(Number(limit))
    .lean();
};

export const getMonthlyAnalytics = async (userId, limit = 6) => {
  return ProgressAggregate.find({ user: userId, periodType: "monthly" })
    .sort({ periodKey: -1 })
    .limit(Number(limit))
    .lean();
};

export const getUserBadges = async (userId) => {
  return UserBadge.find({ user: userId }).sort({ earnedAt: -1 }).lean();
};

export const getDashboardSnapshot = async (userId) => {
  const [goal, streak, insight, weekly, monthly, badges, weightHistory] = await Promise.all([
    getGoalProgress(userId),
    getStreak(userId),
    getLatestInsight(userId),
    getWeeklyAnalytics(userId, 8),
    getMonthlyAnalytics(userId, 6),
    getUserBadges(userId),
    getWeightHistory(userId, 90),
  ]);

  return {
    goal,
    streak,
    insight,
    weekly,
    monthly,
    badges,
    weightHistory,
  };
};

export const getMonthlyFitnessReport = async (userId, monthKeyInput) => {
  const monthKey =
    typeof monthKeyInput === "string" && /^\d{4}-\d{2}$/.test(monthKeyInput)
      ? monthKeyInput
      : getMonthKey(new Date());

  const [rows, goalProgress] = await Promise.all([
    DailyProgress.find({ user: userId, monthKey })
      .sort({ date: 1 })
      .select(
        "date weightKg waistCm chestCm hipsCm armsCm thighsCm adherenceScore workoutsPlanned workoutsCompleted dietAdherencePercent",
      ),
    getGoalProgress(userId),
  ]);

  if (!rows.length) {
    return {
      monthKey,
      dataPoints: 0,
      // Downloadable summary intentionally disabled for now (future scope).
      downloadableSummary: {
        available: false,
        note: "Future feature: downloadable PDF/CSV summary",
      },
      metrics: {
        // 1) Weight change for this month.
        weightChangeKg: null,
        // 2) Measurement change (cm) between first and latest logs in month.
        measurementChange: {
          waistCm: null,
          chestCm: null,
          hipsCm: null,
          armsCm: null,
          thighsCm: null,
        },
        // 3) Habit score average (daily adherence score mean).
        habitScoreAverage: 0,
        // 4) Workout adherence (completed/planned workouts in %).
        workoutAdherencePercent: 0,
        // 5) Diet adherence (average daily diet adherence %).
        dietAdherencePercent: 0,
        // 6) Goal progress % based on user goal, start, current and target values.
        goalProgressPercent: Number(goalProgress?.progressPercent || 0),
      },
    };
  }

  const firstWeight = rows.find((row) => Number.isFinite(row.weightKg))?.weightKg;
  const lastWeight = [...rows].reverse().find((row) => Number.isFinite(row.weightKg))?.weightKg;

  const getMeasurementDelta = (field) => {
    const first = rows.find((row) => Number.isFinite(row[field]))?.[field];
    const last = [...rows].reverse().find((row) => Number.isFinite(row[field]))?.[field];
    if (!Number.isFinite(first) || !Number.isFinite(last)) {
      return null;
    }
    return Number((last - first).toFixed(2));
  };

  const totalWorkoutsPlanned = rows.reduce(
    (sum, row) => sum + Number(row.workoutsPlanned || 0),
    0,
  );
  const totalWorkoutsCompleted = rows.reduce(
    (sum, row) => sum + Number(row.workoutsCompleted || 0),
    0,
  );

  const habitScoreAverage =
    rows.length > 0
      ? Number(
          (
            rows.reduce((sum, row) => sum + Number(row.adherenceScore || 0), 0) / rows.length
          ).toFixed(2),
        )
      : 0;

  const dietAdherencePercent =
    rows.length > 0
      ? Number(
          (
            rows.reduce((sum, row) => sum + Number(row.dietAdherencePercent || 0), 0) /
            rows.length
          ).toFixed(2),
        )
      : 0;

  return {
    monthKey,
    dataPoints: rows.length,
    dateRange: {
      from: rows[0]?.date || null,
      to: rows[rows.length - 1]?.date || null,
    },
    metrics: {
      // 1) Weight change: last logged weight - first logged weight in selected month.
      weightChangeKg:
        Number.isFinite(firstWeight) && Number.isFinite(lastWeight)
          ? Number((lastWeight - firstWeight).toFixed(2))
          : null,
      // 2) Measurement change by body part, useful for recomposition tracking.
      measurementChange: {
        waistCm: getMeasurementDelta("waistCm"),
        chestCm: getMeasurementDelta("chestCm"),
        hipsCm: getMeasurementDelta("hipsCm"),
        armsCm: getMeasurementDelta("armsCm"),
        thighsCm: getMeasurementDelta("thighsCm"),
      },
      // 3) Habit score average across all logged days in month.
      habitScoreAverage,
      // 4) Workout adherence percentage for monthly planned vs completed sessions.
      workoutAdherencePercent:
        totalWorkoutsPlanned > 0
          ? Number(((totalWorkoutsCompleted / totalWorkoutsPlanned) * 100).toFixed(2))
          : 0,
      // 5) Diet adherence percentage as monthly mean of daily diet adherence.
      dietAdherencePercent,
      // 6) Goal progress percentage from goal engine snapshot.
      goalProgressPercent: Number(goalProgress?.progressPercent || 0),
    },
    // Downloadable summary intentionally disabled for now (future scope).
    downloadableSummary: {
      available: false,
      note: "Future feature: downloadable PDF/CSV summary",
    },
  };
};
