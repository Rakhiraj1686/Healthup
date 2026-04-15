import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useProgressData } from "../../config/hooks/useProgressData.js";
import { useAuth } from "../../context/AuthContext";
import ProgressSummaryCards from "../ProgressSummaryCards.jsx";
import InsightPanel from "../InsightPanel.jsx";
import BadgeShelf from "../BadgeShelf.jsx";
import MonthlyFitnessReport from "../MonthlyFitnessReport.jsx";

const getTodayLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const clampPercent = (value, fallback = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(100, Math.max(0, numeric));
};

const smoothAnalogSeries = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];

  const normalized = data.map((point, index) => {
    const prev = index > 0 ? data[index - 1] : point;
    return {
      ...point,
      workout: clampPercent(point.workout, clampPercent(prev?.workout, 0)),
      diet: clampPercent(point.diet, clampPercent(prev?.diet, 0)),
      habit: clampPercent(point.habit, clampPercent(prev?.habit, 0)),
    };
  });

  return normalized.map((point, index) => {
    const prev = normalized[index - 1] || point;
    const next = normalized[index + 1] || point;

    const smoothValue = (key) =>
      Math.round(
        (prev[key] * 0.25 + point[key] * 0.5 + next[key] * 0.25) * 10,
      ) / 10;

    return {
      ...point,
      workout: smoothValue("workout"),
      diet: smoothValue("diet"),
      habit: smoothValue("habit"),
    };
  });
};

const buildGrowthSummary = (data) => {
  if (!Array.isArray(data) || data.length < 2) return null;

  const first = data[0];
  const last = data[data.length - 1];
  const metrics = [
    { key: "workout", label: "Workout" },
    { key: "diet", label: "Diet" },
    { key: "habit", label: "Habit" },
  ];

  return metrics.map(({ key, label }) => {
    const start = clampPercent(first[key], 0);
    const end = clampPercent(last[key], 0);
    const delta = Math.round((end - start) * 10) / 10;
    const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";

    return {
      key,
      label,
      start,
      end,
      delta,
      direction,
    };
  });
};

const ProgressGraph = () => {
  const { user } = useAuth();
  const { dashboard, graphData, loading, saving, error, submitDailyProgress } =
    useProgressData();

  const [formData, setFormData] = useState({
    entryDate: getTodayLocalDate(),
    weightKg: "",
    workoutStatus: "completed",
    caloriesIn: "",
    dietAdherencePercent: "",
    habitAdherencePercent: "",
    energyLevel: "normal",
    waistCm: "",
    chestCm: "",
    hipsCm: "",
    armsCm: "",
    thighsCm: "",
  });
  const [reportRefreshSignal, setReportRefreshSignal] = useState(0);

  const smoothedRealGraphData = useMemo(
    () => smoothAnalogSeries(graphData),
    [graphData],
  );
  const hasRealGraphData = smoothedRealGraphData.length > 0;
  const chartData = smoothedRealGraphData;
  const growthSummary = useMemo(
    () => buildGrowthSummary(chartData),
    [chartData],
  );

  // Get calorie and habit targets from goal data
  const profileCalories = Number(user?.aiPlan?.calories);
  const calorieTarget =
    Number.isFinite(profileCalories) && profileCalories > 0
      ? profileCalories
      : dashboard?.goal?.calorieTarget || dashboard?.targetCalories || 2000;
  const workoutsPerWeek = dashboard?.goal?.workoutsPerWeek || 5;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      await submitDailyProgress({
        entryDate: formData.entryDate,
        weightKg: formData.weightKg,
        workoutStatus: formData.workoutStatus,
        caloriesIn: formData.caloriesIn,
        dietAdherencePercent: formData.dietAdherencePercent,
        habitAdherencePercent: formData.habitAdherencePercent,
        energyLevel: formData.energyLevel,
        waistCm: formData.waistCm,
        chestCm: formData.chestCm,
        hipsCm: formData.hipsCm,
        armsCm: formData.armsCm,
        thighsCm: formData.thighsCm,
      });
      setFormData((prev) => ({
        ...prev,
        entryDate: prev.entryDate,
        weightKg: "",
        caloriesIn: "",
        dietAdherencePercent: "",
        habitAdherencePercent: "",
        waistCm: "",
        chestCm: "",
        hipsCm: "",
        armsCm: "",
        thighsCm: "",
      }));
      setReportRefreshSignal((prev) => prev + 1);
      toast.success("Daily progress saved successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save progress");
    }
  };

  return (
    <div className="w-full bg-white/5 p-4 sm:p-6 rounded-2xl mt-6 sm:mt-8 mb-12 sm:mb-14 min-h-screen">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white">
        AI User Progress Dashboard
      </h2>

      {error && <p className="mb-4 text-xs sm:text-sm text-red-300">{error}</p>}

      <ProgressSummaryCards
        dashboard={dashboard}
        calorieTarget={calorieTarget}
      />

      {/* Calorie and Habit Targets Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 sm:mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Daily Calorie Target</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">
                {calorieTarget} kcal
              </p>
              <p className="text-xs text-gray-300 mt-2">
                Track your daily intake to stay on target
              </p>
            </div>
            <span className="text-4xl">🍽️</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Weekly Workout Target</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">
                {workoutsPerWeek} workouts
              </p>
              <p className="text-xs text-gray-300 mt-2">
                Complete all workouts to build consistency
              </p>
            </div>
            <span className="text-4xl">💪</span>
          </div>
        </div>
      </div>

      <InsightPanel insight={dashboard?.insight} />

      <MonthlyFitnessReport refreshSignal={reportRefreshSignal} />

      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4"
      >
        <label className="text-xs sm:text-sm text-gray-200 flex flex-col gap-2">
          Entry Date
          <input
            type="date"
            name="entryDate"
            value={formData.entryDate}
            onChange={handleChange}
            className="bg-[#0F172A] border border-white/10 rounded-md px-2 sm:px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="text-xs sm:text-sm text-gray-200 flex flex-col gap-2">
          Current Weight (kg)
          <input
            type="number"
            step="0.1"
            min="20"
            max="400"
            name="weightKg"
            value={formData.weightKg}
            onChange={handleChange}
            className="bg-[#0F172A] border border-white/10 rounded-md px-2 sm:px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs sm:text-sm text-gray-200 flex flex-col gap-2">
          Workout Status
          <select
            name="workoutStatus"
            value={formData.workoutStatus}
            onChange={handleChange}
            className="bg-[#0F172A] border border-white/10 rounded-md px-2 sm:px-3 py-2 text-sm"
          >
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
            <option value="skipped">Skipped</option>
            <option value="rest">Rest Day</option>
          </select>
        </label>

        <label className="text-xs sm:text-sm text-gray-200 flex flex-col gap-2">
          Calories Intake (kcal)
          <input
            type="number"
            min="0"
            name="caloriesIn"
            value={formData.caloriesIn}
            onChange={handleChange}
            className="bg-[#0F172A] border border-white/10 rounded-md px-2 sm:px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs sm:text-sm text-gray-200 flex flex-col gap-2">
          Diet Adherence (%)
          <input
            type="number"
            min="0"
            max="100"
            name="dietAdherencePercent"
            value={formData.dietAdherencePercent}
            onChange={handleChange}
            className="bg-[#0F172A] border border-white/10 rounded-md px-2 sm:px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs sm:text-sm text-gray-200 flex flex-col gap-2">
          Habit Adherence (%)
          <input
            type="number"
            min="0"
            max="100"
            name="habitAdherencePercent"
            value={formData.habitAdherencePercent}
            onChange={handleChange}
            className="bg-[#0F172A] border border-white/10 rounded-md px-2 sm:px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs sm:text-sm text-gray-200 flex flex-col gap-2">
          Energy Level
          <select
            name="energyLevel"
            value={formData.energyLevel}
            onChange={handleChange}
            className="bg-[#0F172A] border border-white/10 rounded-md px-2 sm:px-3 py-2 text-sm"
          >
            <option value="energized">Energized</option>
            <option value="normal">Normal</option>
            <option value="slightly_fatigued">Slightly Fatigued</option>
            <option value="very_tired">Very Tired</option>
          </select>
        </label>

        <label className="text-xs sm:text-sm text-gray-200 flex flex-col gap-2">
          Waist (cm)
          <input
            type="number"
            min="0"
            name="waistCm"
            value={formData.waistCm}
            onChange={handleChange}
            className="bg-[#0F172A] border border-white/10 rounded-md px-2 sm:px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs sm:text-sm text-gray-200 flex flex-col gap-2">
          Chest (cm)
          <input
            type="number"
            min="0"
            name="chestCm"
            value={formData.chestCm}
            onChange={handleChange}
            className="bg-[#0F172A] border border-white/10 rounded-md px-2 sm:px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs sm:text-sm text-gray-200 flex flex-col gap-2">
          Hips (cm)
          <input
            type="number"
            min="0"
            name="hipsCm"
            value={formData.hipsCm}
            onChange={handleChange}
            className="bg-[#0F172A] border border-white/10 rounded-md px-2 sm:px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs sm:text-sm text-gray-200 flex flex-col gap-2">
          Arms (cm)
          <input
            type="number"
            min="0"
            name="armsCm"
            value={formData.armsCm}
            onChange={handleChange}
            className="bg-[#0F172A] border border-white/10 rounded-md px-2 sm:px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs sm:text-sm text-gray-200 flex flex-col gap-2">
          Thighs (cm)
          <input
            type="number"
            min="0"
            name="thighsCm"
            value={formData.thighsCm}
            onChange={handleChange}
            className="bg-[#0F172A] border border-white/10 rounded-md px-2 sm:px-3 py-2 text-sm"
          />
        </label>

        <div className="sm:col-span-2 lg:col-span-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mt-3 sm:mt-0">
          <p className="text-gray-300 text-xs sm:text-sm">
            Selected Date: {formData.entryDate}
          </p>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-lg bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {saving ? "Saving..." : "Save Daily Progress"}
          </button>
        </div>
      </form>

      <div className="mb-8 rounded-2xl border border-cyan-400/20 bg-linear-to-br from-[#0B1228]/95 to-[#111A34]/95 p-4 sm:p-6 lg:p-8 shadow-[0_0_30px_rgba(59,130,246,0.18)] w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white">
            Daily Progress Tracking
          </h3>

          <span className="text-[11px] sm:text-xs text-gray-400">
            Analog trend view (0-100%)
          </span>
        </div>

        {/* Growth Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3 lg:gap-4 mb-6">
          {(growthSummary || []).map((item) => (
            <div
              key={item.key}
              className="rounded-xl border border-cyan-400/20 bg-white/5 px-3 py-3 lg:px-4"
            >
              <p className="text-[11px] text-gray-400">{item.label} Growth</p>

              <div className="flex items-center justify-between mt-2">
                <p className="text-xs sm:text-sm text-gray-300">
                  {item.start}% to {item.end}%
                </p>

                <p
                  className={`text-xs sm:text-sm font-semibold ${
                    item.direction === "up"
                      ? "text-emerald-400"
                      : item.direction === "down"
                        ? "text-rose-400"
                        : "text-cyan-300"
                  }`}
                >
                  {item.delta > 0 ? `+${item.delta}` : item.delta}%
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="w-full h-65 sm:h-80 lg:h-105 xl:h-115">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="2 6"
                stroke="rgba(148,163,184,0.25)"
                vertical={false}
              />

              <XAxis
                dataKey="dateLabel"
                stroke="#94a3b8"
                tick={{ fontSize: 12, fill: "#cbd5e1" }}
                tickMargin={10}
              />

              <YAxis
                stroke="#94a3b8"
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#cbd5e1" }}
                width={40}
              />

              <Tooltip
                formatter={(value) => `${value}%`}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: "#0B1228",
                  border: "1px solid rgba(59,130,246,0.4)",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                }}
              />

              <Legend wrapperStyle={{ paddingTop: "14px", fontSize: "13px" }} />

              <Line
                type="natural"
                dataKey="workout"
                stroke="#8b5cf6"
                name="Workout Adherence"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />

              <Line
                type="natural"
                dataKey="diet"
                stroke="#38bdf8"
                name="Diet Adherence"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />

              <Line
                type="natural"
                dataKey="habit"
                stroke="#10b981"
                name="Habit Score"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      
      <BadgeShelf badges={dashboard?.badges || []} />

      {hasRealGraphData ? (
        <p className="text-xs sm:text-sm text-gray-400 mt-4">
          To validate the real analog trend, fill daily data for 3-7 days, then
          check the growth cards above for exact increase or decrease.
        </p>
      ) : (
        <p className="text-xs sm:text-sm text-cyan-300 mt-4">
          No real progress points are available yet. Select an Entry Date and
          save data for a few days to display the graph.
        </p>
      )}
    </div>
  );
};

export default ProgressGraph;
