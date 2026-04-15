import { useCallback, useEffect, useState } from "react";
import {
  getProgressDashboard,
  getProgressOverviewGraph,
  logWeight,
  logWorkout,
  logDailyCheckin,
} from "../progressApi"

const initialDashboard = {
  goal: { progressPercent: 0, currentWeight: null, targetWeight: null },
  streak: { currentStreakDays: 0, longestStreakDays: 0 },
  insight: { summary: "No insight yet", riskFlags: [] },
  badges: [],
  weekly: [],
  monthly: [],
  weightHistory: [],
};

export const useProgressData = () => {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [dashboardData, overviewGraph] = await Promise.all([
        getProgressDashboard(),
        getProgressOverviewGraph(),
      ]);

      // Calculate streak from graphData (workout history)
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      if (overviewGraph && overviewGraph.length > 0) {
        for (let i = overviewGraph.length - 1; i >= 0; i--) {
          if (overviewGraph[i].workout > 0) {
            tempStreak++;
            if (i === overviewGraph.length - 1) {
              currentStreak = tempStreak;
            }
          } else {
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
            }
            tempStreak = 0;
          }
        }

        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      }

      // Merge calculated streak with dashboard data
      const updatedDashboard = {
        ...(dashboardData || initialDashboard),
        streak: {
          currentStreakDays: currentStreak,
          longestStreakDays: longestStreak,
        },
      };

      setDashboard(updatedDashboard);
      setGraphData(overviewGraph);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load progress dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitDailyProgress = async ({
    entryDate,
    weightKg,
    workoutStatus = "completed",
    caloriesIn,
    dietAdherencePercent,
    habitAdherencePercent,
    energyLevel,
    waistCm,
    chestCm,
    hipsCm,
    armsCm,
    thighsCm,
  }) => {
    try {
      setSaving(true);
      setError("");

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const selectedDate = entryDate
        ? new Date(`${entryDate}T12:00:00`).toISOString()
        : new Date().toISOString();

      if (weightKg !== undefined && weightKg !== null && weightKg !== "") {
        await logWeight({
          date: selectedDate,
          timezone,
          weightKg: Number(weightKg),
        });
      }

      if (workoutStatus) {
        await logWorkout({
          status: workoutStatus,
          scheduledDate: selectedDate,
          planWorkoutId: `manual-${Date.now()}`,
        });
      }

      const hasCheckinData =
        (caloriesIn !== undefined && caloriesIn !== null && caloriesIn !== "") ||
        (dietAdherencePercent !== undefined &&
          dietAdherencePercent !== null &&
          dietAdherencePercent !== "") ||
        (habitAdherencePercent !== undefined &&
          habitAdherencePercent !== null &&
          habitAdherencePercent !== "") ||
        !!energyLevel ||
        (waistCm !== undefined && waistCm !== null && waistCm !== "") ||
        (chestCm !== undefined && chestCm !== null && chestCm !== "") ||
        (hipsCm !== undefined && hipsCm !== null && hipsCm !== "") ||
        (armsCm !== undefined && armsCm !== null && armsCm !== "") ||
        (thighsCm !== undefined && thighsCm !== null && thighsCm !== "");

      if (hasCheckinData) {
        await logDailyCheckin({
          date: selectedDate,
          timezone,
          caloriesIn:
            caloriesIn !== undefined && caloriesIn !== null && caloriesIn !== ""
              ? Number(caloriesIn)
              : undefined,
          dietAdherencePercent:
            dietAdherencePercent !== undefined &&
            dietAdherencePercent !== null &&
            dietAdherencePercent !== ""
              ? Number(dietAdherencePercent)
              : undefined,
          habitAdherencePercent:
            habitAdherencePercent !== undefined &&
            habitAdherencePercent !== null &&
            habitAdherencePercent !== ""
              ? Number(habitAdherencePercent)
              : undefined,
          energyLevel,
          waistCm:
            waistCm !== undefined && waistCm !== null && waistCm !== ""
              ? Number(waistCm)
              : undefined,
          chestCm:
            chestCm !== undefined && chestCm !== null && chestCm !== ""
              ? Number(chestCm)
              : undefined,
          hipsCm:
            hipsCm !== undefined && hipsCm !== null && hipsCm !== ""
              ? Number(hipsCm)
              : undefined,
          armsCm:
            armsCm !== undefined && armsCm !== null && armsCm !== ""
              ? Number(armsCm)
              : undefined,
          thighsCm:
            thighsCm !== undefined && thighsCm !== null && thighsCm !== ""
              ? Number(thighsCm)
              : undefined,
        });
      }

      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save progress");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    dashboard,
    graphData,
    loading,
    saving,
    error,
    reload: load,
    submitDailyProgress,
  };
};
