import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/Api";
import toast from "react-hot-toast";
import { FiChevronDown, FiChevronUp, FiRefreshCcw, FiTarget } from "react-icons/fi";

const PlanAdjustmentPanel = ({ onAdjustmentApplied }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const formatPercent = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `${numeric.toFixed(1)}%` : "--";
  };

  const getEnergyStatus = (weeklyMetrics, insight) => {
    if (insight?.riskFlags?.includes("low_adherence")) {
      return "Low";
    }

    const adherence = Number(weeklyMetrics?.avgAdherence);
    const completion = Number(weeklyMetrics?.workoutCompletion);

    if (Number.isFinite(adherence) && Number.isFinite(completion)) {
      const score = (adherence + completion) / 2;
      if (score >= 80) return "High";
      if (score >= 60) return "Moderate";
      return "Low";
    }

    return "Unknown";
  };

  const getForecastDate = (goal, weeklyMetrics) => {
    const currentWeight = Number(goal?.currentWeight);
    const targetWeight = Number(goal?.targetWeight);
    const weeklyChange = Number(weeklyMetrics?.weeklyWeightChange);

    if (
      !Number.isFinite(currentWeight) ||
      !Number.isFinite(targetWeight) ||
      !Number.isFinite(weeklyChange) ||
      weeklyChange === 0
    ) {
      return "Insufficient trend data";
    }

    const deltaToGoal = targetWeight - currentWeight;
    const movingTowardGoal =
      (deltaToGoal < 0 && weeklyChange < 0) || (deltaToGoal > 0 && weeklyChange > 0);

    if (!movingTowardGoal) {
      return "Off-track currently";
    }

    const weeksToGoal = Math.abs(deltaToGoal / weeklyChange);
    if (!Number.isFinite(weeksToGoal) || weeksToGoal <= 0) {
      return "Insufficient trend data";
    }

    const forecastDate = new Date();
    forecastDate.setDate(forecastDate.getDate() + Math.ceil(weeksToGoal * 7));

    return forecastDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getMeasurementTrend = (history, weeklyMetrics) => {
    const weeklyWeightChange = Number(weeklyMetrics?.weeklyWeightChange);
    const prevWeekWeightChange = Number(weeklyMetrics?.prevWeekWeightChange);
    const rows = Array.isArray(history) ? history : [];

    if (Number.isFinite(weeklyWeightChange) && Number.isFinite(prevWeekWeightChange)) {
      const current = `${weeklyWeightChange > 0 ? "+" : ""}${weeklyWeightChange.toFixed(2)} kg`;
      const previous = `${prevWeekWeightChange > 0 ? "+" : ""}${prevWeekWeightChange.toFixed(2)} kg`;
      return `This week ${current} (prev ${previous})`;
    }

    if (rows.length >= 2) {
      const latest = Number(rows[rows.length - 1]?.weightKg);
      const previous = Number(rows[rows.length - 2]?.weightKg);

      if (Number.isFinite(latest) && Number.isFinite(previous)) {
        const delta = latest - previous;
        return `Latest change ${delta > 0 ? "+" : ""}${delta.toFixed(2)} kg`;
      }
    }

    return "No recent trend available";
  };

  const getAdjustmentSummary = (adjustments) => {
    if (!adjustments) {
      return "No adjustment data yet";
    }

    const calorie = Number(adjustments.calorieAdjust || 0);
    const workout = Number(adjustments.workoutAdjust || 0);
    const simplify = !!adjustments.simplifyWorkouts;

    if (calorie === 0 && workout === 0 && !simplify) {
      return "No changes required";
    }

    const parts = [];
    if (calorie !== 0) parts.push(`Calories ${calorie > 0 ? "+" : ""}${calorie} kcal`);
    if (workout !== 0) parts.push(`Workouts ${workout > 0 ? "+" : ""}${workout}/week`);
    if (simplify) parts.push("Simplified workouts");

    return parts.join(" • ");
  };

  const getTodayWorkout = (plan) => {
    const workoutDays = plan?.workoutDays;
    if (!Array.isArray(workoutDays) || workoutDays.length === 0) {
      return null;
    }

    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    return (
      workoutDays.find((item) => String(item?.dayName || "").toLowerCase() === todayName) ||
      workoutDays[0]
    );
  };

  const refreshDashboard = async () => {
    try {
      setLoadingDashboard(true);
      const res = await api.get("/api/v1/progress/dashboard");
      setDashboardData(res.data?.data || null);
    } catch {
      toast.error("Failed to refresh progress snapshot");
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const handleEvaluatePlan = async () => {
    setLoading(true);
    try {
      const evaluationRes = await api.post("/user/plan/evaluate");

      const evaluationData = evaluationRes.data;
      setAdjustmentData(evaluationData);

      try {
        const dashboardRes = await api.get("/api/v1/progress/dashboard");
        setDashboardData(dashboardRes.data?.data || null);
      } catch {
        toast.error("Plan evaluated, but failed to refresh progress snapshot");
      }

      if (typeof onAdjustmentApplied === "function") {
        onAdjustmentApplied(evaluationData);
      }

      if (evaluationData.triggers && evaluationData.triggers.length > 0) {
        toast.success(`Plan evaluated! ${evaluationData.triggers.length} adjustment(s) found 🎯`);
        setExpanded(true);
      } else {
        toast("Your plan is optimal for your current progress! 💪");
        setExpanded(true);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to evaluate plan");
    } finally {
      setLoading(false);
    }
  };

  const { adjustments = null, triggers = [], weeklyMetrics = null } = adjustmentData || {};
  const activeGoal = user?.primaryGoal || user?.goal || "maintain";
  const todayWorkout = getTodayWorkout(user?.aiPlan);
  const goal = dashboardData?.goal;
  const insight = dashboardData?.insight;

  const workoutAdherence = Number(weeklyMetrics?.workoutCompletion);
  const dietAdherence = Number(weeklyMetrics?.avgAdherence);
  const latestWeeklyAdherence = Number(dashboardData?.weekly?.[0]?.adherenceAvg);
  const habitScore = Number.isFinite(workoutAdherence) && Number.isFinite(dietAdherence)
    ? ((workoutAdherence + dietAdherence) / 2).toFixed(1)
    : Number.isFinite(latestWeeklyAdherence)
      ? latestWeeklyAdherence.toFixed(1)
      : "--";

  const measurementTrends = getMeasurementTrend(dashboardData?.weightHistory, weeklyMetrics);
  const aiCoachingSuggestion = insight?.summary || triggers?.[0]?.message || "Maintain consistency this week and re-evaluate after more check-ins.";
  const adjustmentSummary = getAdjustmentSummary(adjustments);
  const goalForecastDate = getForecastDate(goal, weeklyMetrics);
  const energyStatus = getEnergyStatus(weeklyMetrics, insight);

  return (
    <div className="bg-linear-to-br from-blue-600/20 via-cyan-600/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6 mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <FiTarget className="text-blue-300" /> Centralized Plan Control Pane
          </h3>
          <p className="text-gray-300 text-sm">
            {!adjustmentData
              ? "Evaluate your plan to generate live adjustment insights."
              : triggers?.length === 0
                ? "✅ Your plan is optimized! No adjustments needed."
                : `🎯 ${triggers?.length} adjustment(s) detected based on your progress`}
          </p>
        </div>
        <button className="text-blue-400 text-xl">
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>

      {expanded && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-gray-400 uppercase mb-1">Active Goal</p>
              <p className="text-white font-semibold capitalize">{activeGoal}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-gray-400 uppercase mb-1">Today's Workout</p>
              <p className="text-white font-semibold">
                {todayWorkout?.focus || "No workout found"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {todayWorkout?.duration || "--"}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-gray-400 uppercase mb-1">Diet Adherence</p>
              <p className="text-white font-semibold">{formatPercent(dietAdherence)}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-gray-400 uppercase mb-1">Workout Adherence</p>
              <p className="text-white font-semibold">{formatPercent(workoutAdherence)}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-gray-400 uppercase mb-1">Habit Score</p>
              <p className="text-white font-semibold">{habitScore === "--" ? "--" : `${habitScore}%`}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-gray-400 uppercase mb-1">Energy Status</p>
              <p className="text-white font-semibold">{energyStatus}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-gray-400 uppercase mb-1">Goal Forecast Date</p>
              <p className="text-white font-semibold">{goalForecastDate}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-gray-400 uppercase mb-1">Measurement Trends</p>
              <p className="text-white font-semibold">{measurementTrends}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10 md:col-span-2 xl:col-span-1">
              <p className="text-xs text-gray-400 uppercase mb-1">Adjustment Summary</p>
              <p className="text-white font-semibold">{adjustmentSummary}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10 md:col-span-2 xl:col-span-3">
              <p className="text-xs text-gray-400 uppercase mb-1">AI Coaching Suggestion</p>
              <p className="text-white font-semibold">{aiCoachingSuggestion}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-3">Centralized Control Pane</h4>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleEvaluatePlan}
                disabled={loading}
                className="px-4 py-2 bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Evaluating..." : "Re-evaluate Plan"}
              </button>
              <button
                onClick={refreshDashboard}
                disabled={loadingDashboard}
                className="px-4 py-2 bg-white/10 rounded-lg text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiRefreshCcw className={loadingDashboard ? "animate-spin" : ""} />
                {loadingDashboard ? "Refreshing..." : "Refresh Snapshot"}
              </button>
              <button
                onClick={() => setExpanded(false)}
                className="px-4 py-2 bg-white/10 rounded-lg text-white font-semibold"
              >
                Collapse
              </button>
            </div>
          </div>

          {triggers && triggers.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-3">Detected Triggers</h4>
              <div className="space-y-2">
                {triggers.map((item, idx) => (
                  <div key={idx} className="p-2 bg-white/5 rounded-lg text-sm text-gray-300">
                    {item?.message || item?.trigger || "Adjustment trigger detected"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanAdjustmentPanel;
