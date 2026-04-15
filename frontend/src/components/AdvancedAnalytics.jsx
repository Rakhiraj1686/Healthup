import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/Api";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { FiRefreshCcw, FiTarget, FiTrendingDown } from "react-icons/fi";

const AdvancedAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("habits");
  const [analyticsData, setAnalyticsData] = useState(null);

  const fetchAdvancedAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/progress/analytics/advanced?weeks=8");
      setAnalyticsData(res.data.data);
      toast.success("Analytics loaded");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load analytics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, []);

  const formatValue = (value, decimals = 1) => {
    if (value === null || value === undefined) return "--";
    return Number(value).toFixed(decimals);
  };

  const getVelocityInsight = (velocity) => {
    const goalText = String(user?.primaryGoal || user?.goal || "").toLowerCase();
    const weightVelocity = Number(velocity?.weightVelocity);
    const adherenceVelocity = Number(velocity?.adherenceVelocity);

    const improvingAdherence = Number.isFinite(adherenceVelocity) && adherenceVelocity >= 0;

    if (goalText.includes("weight") && goalText.includes("loss")) {
      if (Number.isFinite(weightVelocity) && weightVelocity < 0 && improvingAdherence) {
        return { text: "On track for fat loss", tone: "text-green-400" };
      }
      return { text: "Needs attention for fat loss", tone: "text-yellow-400" };
    }

    if (goalText.includes("muscle") && goalText.includes("gain")) {
      if (Number.isFinite(weightVelocity) && weightVelocity > 0 && improvingAdherence) {
        return { text: "On track for muscle gain", tone: "text-green-400" };
      }
      return { text: "Needs attention for muscle gain", tone: "text-yellow-400" };
    }

    if (improvingAdherence) {
      return { text: "Habits improving steadily", tone: "text-green-400" };
    }

    return { text: "Build consistency for better momentum", tone: "text-yellow-400" };
  };

  const getRoadmapStatus = (roadmap) => {
    const goalText = String(user?.primaryGoal || user?.goal || "").toLowerCase();
    const velocity = Number(roadmap?.weeklyVelocity);

    if (!Number.isFinite(velocity)) {
      return { label: "Insufficient Data", tone: "text-yellow-300", chip: "bg-yellow-500/20 border-yellow-400/40" };
    }

    if (goalText.includes("weight") && goalText.includes("loss")) {
      return velocity < 0
        ? { label: "On Track", tone: "text-emerald-300", chip: "bg-emerald-500/20 border-emerald-400/40" }
        : { label: "Needs Attention", tone: "text-rose-300", chip: "bg-rose-500/20 border-rose-400/40" };
    }

    if (goalText.includes("muscle") && goalText.includes("gain")) {
      return velocity > 0
        ? { label: "On Track", tone: "text-emerald-300", chip: "bg-emerald-500/20 border-emerald-400/40" }
        : { label: "Needs Attention", tone: "text-rose-300", chip: "bg-rose-500/20 border-rose-400/40" };
    }

    return { label: "Monitoring", tone: "text-cyan-300", chip: "bg-cyan-500/20 border-cyan-400/40" };
  };

  // 1. MULTI-WEEK HABIT TRENDS
  const HabitTrends = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
        <h3 className="text-lg font-bold mb-4 text-white">Weekly Adherence Trends</h3>
        {analyticsData?.habitTrends && analyticsData.habitTrends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.habitTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="week"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.2)" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgAdherence"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Avg Adherence %"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="habitConsistency"
                stroke="#06b6d4"
                strokeWidth={2}
                name="Habit Consistency %"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">No trend data available</p>
        )}

        {/* Details table */}
        {analyticsData?.habitTrends && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-4 py-2 text-left">Week</th>
                  <th className="px-4 py-2 text-center">Adherence</th>
                  <th className="px-4 py-2 text-center">Consistency</th>
                  <th className="px-4 py-2 text-center">Workouts</th>
                  <th className="px-4 py-2 text-center">Energy</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.habitTrends.slice(-4).map((week) => (
                  <tr key={week.week} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2">{week.week}</td>
                    <td className="px-4 py-2 text-center">{formatValue(week.avgAdherence)}%</td>
                    <td className="px-4 py-2 text-center">{formatValue(week.habitConsistency)}%</td>
                    <td className="px-4 py-2 text-center">{week.workoutDaysCompleted}</td>
                    <td className="px-4 py-2 text-center capitalize text-sm">
                      {week.dominantEnergyLevel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // 2. PROGRESS VELOCITY ANALYSIS
  const VelocityAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
        <h3 className="text-lg font-bold mb-4 text-white">Weight & Adherence Velocity</h3>
        {analyticsData?.velocityAnalysis && analyticsData.velocityAnalysis.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={analyticsData.velocityAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="week"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 12 }}
              />
              <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" />
              <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.2)" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="weightVelocity"
                fill="#f43f5e"
                name="Weight Change (kg/week)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="adherenceVelocity"
                stroke="#10b981"
                strokeWidth={2}
                name="Adherence Change (%/week)"
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">No velocity data available</p>
        )}

        {/* Summary */}
        {analyticsData?.velocityAnalysis && analyticsData.velocityAnalysis.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {analyticsData.velocityAnalysis.slice(-1).map((vel) => (
              <div key={vel.week} className="bg-white/5 p-4 rounded-xl text-center">
                <p className="text-gray-400 text-sm">Weight Velocity</p>
                <p className="text-lg font-bold text-white">
                  {formatValue(vel.weightVelocity)} kg/week
                </p>
              </div>
            ))}
            {analyticsData.velocityAnalysis.slice(-1).map((vel) => (
              <div key={vel.week} className="bg-white/5 p-4 rounded-xl text-center">
                <p className="text-gray-400 text-sm">Adherence Velocity</p>
                <p className="text-lg font-bold text-white">
                  {formatValue(vel.adherenceVelocity)}%/week
                </p>
              </div>
            ))}
            {analyticsData.velocityAnalysis.slice(-1).map((vel) => (
              <div key={vel.week} className="bg-white/5 p-4 rounded-xl text-center">
                <p className="text-gray-400 text-sm">Trend</p>
                <p
                  className={`text-lg font-bold ${
                    vel.trend === "decreasing"
                      ? "text-green-400"
                      : vel.trend === "increasing"
                        ? "text-red-400"
                        : "text-yellow-400"
                  }`}
                >
                  {vel.trend}
                </p>
              </div>
            ))}
          </div>
        )}

        {analyticsData?.velocityAnalysis && analyticsData.velocityAnalysis.length > 0 && (
          <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4">
            {analyticsData.velocityAnalysis.slice(-1).map((vel) => {
              const insight = getVelocityInsight(vel);
              return (
                <p key={`insight-${vel.week}`} className={`text-sm font-semibold ${insight.tone}`}>
                  Velocity Insight: {insight.text}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // 3. WORKOUT VOLUME PROGRESSION
  const WorkoutVolume = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
        <h3 className="text-lg font-bold mb-4 text-white">Workout Volume & Duration</h3>
        {analyticsData?.workoutProgression && analyticsData.workoutProgression.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={analyticsData.workoutProgression}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="week"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 12 }}
              />
              <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" />
              <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.2)" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="workoutsCompleted"
                fill="#3b82f6"
                name="Workouts Completed"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalDurationMin"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Total Duration (min)"
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">No workout data available</p>
        )}

        {/* Stats */}
        {analyticsData?.workoutProgression && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-4 py-2 text-left">Week</th>
                  <th className="px-4 py-2 text-center">Completed</th>
                  <th className="px-4 py-2 text-center">Missed</th>
                  <th className="px-4 py-2 text-center">Total Min</th>
                  <th className="px-4 py-2 text-center">Avg/Workout</th>
                  <th className="px-4 py-2 text-center">Completion %</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.workoutProgression.slice(-4).map((week) => (
                  <tr key={week.week} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2">{week.week}</td>
                    <td className="px-4 py-2 text-center text-green-400">{week.workoutsCompleted}</td>
                    <td className="px-4 py-2 text-center text-red-400">{week.workoutsMissed}</td>
                    <td className="px-4 py-2 text-center">{week.totalDurationMin}</td>
                    <td className="px-4 py-2 text-center">{formatValue(week.avgDurationPerWorkout)}</td>
                    <td className="px-4 py-2 text-center font-semibold">{formatValue(week.completionRate)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // 4. DIET MACRO ACCURACY
  const MacroAccuracy = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
        <h3 className="text-lg font-bold mb-4 text-white">Protein & Calorie Accuracy</h3>
        {analyticsData?.macroAccuracy && analyticsData.macroAccuracy.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.macroAccuracy}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="week"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.2)" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="proteinAccuracy"
                stroke="#ec4899"
                strokeWidth={2}
                name="Protein Accuracy %"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="calorieAccuracy"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Calorie Accuracy %"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">No macro data available</p>
        )}

        {/* Detailed breakdown */}
        {analyticsData?.macroAccuracy && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-4 py-2 text-left">Week</th>
                  <th className="px-4 py-2 text-center">Protein (g)</th>
                  <th className="px-4 py-2 text-center">Accuracy</th>
                  <th className="px-4 py-2 text-center">Calories</th>
                  <th className="px-4 py-2 text-center">Accuracy</th>
                  <th className="px-4 py-2 text-center">Adherence</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.macroAccuracy.slice(-4).map((week) => (
                  <tr key={week.week} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2">{week.week}</td>
                    <td className="px-4 py-2 text-center">
                      {formatValue(week.avgProteinLogged)}/{week.targetProtein}
                    </td>
                    <td className="px-4 py-2 text-center font-semibold">
                      <span
                        className={
                          week.proteinAccuracy >= 90
                            ? "text-green-400"
                            : week.proteinAccuracy >= 75
                              ? "text-yellow-400"
                              : "text-red-400"
                        }
                      >
                        {formatValue(week.proteinAccuracy)}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {formatValue(week.avgCaloriesLogged)}/{week.targetCalories}
                    </td>
                    <td className="px-4 py-2 text-center font-semibold">
                      <span
                        className={
                          week.calorieAccuracy >= 90
                            ? "text-green-400"
                            : week.calorieAccuracy >= 75
                              ? "text-yellow-400"
                              : "text-red-400"
                        }
                      >
                        {formatValue(week.calorieAccuracy)}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">{formatValue(week.dietAdherenceScore)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // 5. MULTI-WEEK ROADMAP
  const Roadmap = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <FiTarget className="text-2xl text-purple-400" />
          <h3 className="text-lg font-bold text-white">Goal Achievement Roadmap</h3>
          {analyticsData?.roadmap && (() => {
            const status = getRoadmapStatus(analyticsData.roadmap);
            return (
              <span
                className={`ml-auto text-xs px-3 py-1 rounded-full border ${status.chip} ${status.tone}`}
              >
                {status.label}
              </span>
            );
          })()}
        </div>

        {analyticsData?.roadmap && (
          <div>
            {/* Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 p-4 rounded-xl text-center">
                <p className="text-gray-400 text-sm">Current Weight</p>
                <p className="text-2xl font-bold text-white">
                  {formatValue(analyticsData.roadmap.currentWeight)} kg
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl text-center">
                <p className="text-gray-400 text-sm">Target Weight</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatValue(analyticsData.roadmap.targetWeight)} kg
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl text-center">
                <p className="text-gray-400 text-sm">Weekly Velocity</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatValue(analyticsData.roadmap.weeklyVelocity)} kg/week
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl text-center">
                <p className="text-gray-400 text-sm">Weeks to Goal</p>
                <p className="text-2xl font-bold text-yellow-400">
                  ~{analyticsData.roadmap.projectedWeeksToGoal}
                </p>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-2">
              <div className="mb-3 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3">
                <p className="text-xs text-cyan-200">
                  How to read: Weekly Velocity shows your current pace. Weeks to Goal is the estimated duration at the same pace.
                  Each milestone predicts expected weight for that week.
                </p>
              </div>
              <p className="text-gray-400 text-sm font-semibold mb-4">Projected Milestones</p>
              {analyticsData.roadmap.roadmap && analyticsData.roadmap.roadmap.map((milestone, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl flex items-center justify-between ${
                    milestone.status === "achieved"
                      ? "bg-green-900/30 border border-green-500/50"
                      : milestone.status === "goal"
                        ? "bg-purple-900/30 border border-purple-500/50"
                        : "bg-blue-900/30 border border-blue-500/50"
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold">
                      Week {milestone.week} ({Math.ceil(milestone.daysFromNow / 7)} weeks from now)
                    </p>
                    <p className="text-gray-300 text-sm">
                      By this week, expected weight is {formatValue(milestone.projectedWeight)} kg.
                      {milestone.status === "goal" && " 🎯"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Remaining</p>
                    <p className="text-lg font-bold text-white">
                      {formatValue(milestone.weightToLose)} kg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!analyticsData?.roadmap && (
          <p className="text-gray-400">No goal data available for roadmap projection</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Advanced Analytics
          </h2>
          <button
            onClick={fetchAdvancedAnalytics}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FiRefreshCcw className={loading ? "animate-spin" : ""} /> 
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["habits", "velocity", "workout", "macro", "roadmap"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
                activeTab === tab
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              {tab === "habits"
                ? "📊 Habits"
                : tab === "velocity"
                  ? "📈 Velocity"
                  : tab === "workout"
                    ? "💪 Workouts"
                    : tab === "macro"
                      ? "🍽️ Macros"
                      : "🎯 Roadmap"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fadeIn">
          {activeTab === "habits" && <HabitTrends />}
          {activeTab === "velocity" && <VelocityAnalysis />}
          {activeTab === "workout" && <WorkoutVolume />}
          {activeTab === "macro" && <MacroAccuracy />}
          {activeTab === "roadmap" && <Roadmap />}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
