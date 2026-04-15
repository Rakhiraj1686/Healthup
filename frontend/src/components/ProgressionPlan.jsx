import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/Api";
import toast from "react-hot-toast";
import { FiRefreshCcw, FiTrendingUp, FiCalendar, FiTarget } from "react-icons/fi";

const ProgressionPlan = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [weekDetails, setWeekDetails] = useState(null);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/progress/plan/progression?weeks=8");
      if (res.data.success && res.data.data.plan) {
        setPlan(res.data.data);
        setSelectedWeek(1);
      }
      toast.success("Progression plan loaded");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load plan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeekDetails = async (week) => {
    try {
      const res = await api.get(`/api/v1/progress/plan/week/${week}`);
      if (res.data.success) {
        setWeekDetails(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching week details:", error);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  useEffect(() => {
    if (plan && selectedWeek) {
      fetchWeekDetails(selectedWeek);
    }
  }, [selectedWeek, plan]);

  if (!plan || !plan.plan) {
    return (
      <div className="min-h-screen text-white p-4 sm:p-8">
        <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-gray-400">No progression plan available. Set a goal to get started.</p>
          <button
            onClick={fetchPlan}
            className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
          >
            Load Plan
          </button>
        </div>
      </div>
    );
  }

  const currentWeekPlan = plan.plan[selectedWeek - 1];

  return (
    <div className="min-h-screen text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {plan.durationWeeks}-Week Progression Plan
            </h2>
            <p className="text-gray-400 mt-2">
              {plan.startingWeight} kg → {plan.targetWeight} kg ({plan.totalChange} kg total)
            </p>
          </div>
          <button
            onClick={fetchPlan}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg flex items-center gap-2 h-fit"
          >
            <FiRefreshCcw className={loading ? "animate-spin" : ""} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Overall Strategy */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Strategy</p>
            <p className="text-lg font-bold text-purple-400 capitalize">{plan.strategy}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Experience</p>
            <p className="text-lg font-bold text-blue-400 capitalize">{plan.experienceLevel}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Weekly Change</p>
            <p className="text-lg font-bold text-green-400">{plan.weeklyChangeNeeded} kg</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Goal</p>
            <p className="text-lg font-bold text-yellow-400 capitalize">{plan.dietGoal}</p>
          </div>
        </div>

        {/* Week Selector */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-4 text-white">Select Week</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {plan.plan.map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setSelectedWeek(idx + 1)}
                className={`py-3 px-2 rounded-lg font-semibold transition ${
                  selectedWeek === idx + 1
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                W{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Current Week Details */}
        {currentWeekPlan && (
          <div className="space-y-6">
            {/* Week Overview */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <FiCalendar className="text-2xl text-purple-400" />
                <h3 className="text-2xl font-bold text-white">Week {selectedWeek}</h3>
                <span className="ml-auto px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm font-semibold capitalize">
                  {currentWeekPlan.intensity.description}
                </span>
              </div>

              {/* Milestones */}
              {currentWeekPlan.milestones.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                  <p className="text-yellow-300 font-semibold">
                    🎯 Milestone: {currentWeekPlan.milestones.join(", ")}
                  </p>
                </div>
              )}

              {/* Intensity Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Workouts/Week</p>
                  <p className="text-2xl font-bold text-blue-300">{currentWeekPlan.intensity.workoutsPerWeek}</p>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Avg Duration</p>
                  <p className="text-2xl font-bold text-blue-300">{currentWeekPlan.intensity.avgDurationMin}min</p>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">RPE Level</p>
                  <p className="text-2xl font-bold text-blue-300">{currentWeekPlan.intensity.rpeLevel}/10</p>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Intensity %</p>
                  <p className="text-2xl font-bold text-blue-300">{currentWeekPlan.intensity.intensityPercent}%</p>
                </div>
              </div>

              {/* Diet Section */}
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-3">Diet Adjustment: {currentWeekPlan.diet.adjustment}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-xs">Calories</p>
                    <p className="text-2xl font-bold text-orange-300">{currentWeekPlan.diet.calories}</p>
                    <p className="text-xs text-gray-500 mt-1">kcal/day</p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-xs">Protein</p>
                    <p className="text-2xl font-bold text-green-300">{currentWeekPlan.diet.protein}g</p>
                  </div>
                  <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-xs">Carbs</p>
                    <p className="text-2xl font-bold text-cyan-300">{currentWeekPlan.diet.carbs}g</p>
                  </div>
                  <div className="bg-pink-900/20 border border-pink-500/30 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-xs">Fats</p>
                    <p className="text-2xl font-bold text-pink-300">{currentWeekPlan.diet.fats}g</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Projection */}
            {/* <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <FiTrendingUp className="text-2xl text-green-400" />
                <h3 className="text-xl font-bold text-white">Progress Projection</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Projected Weight</p>
                  <p className="text-2xl font-bold text-green-400">{currentWeekPlan.projection.projectedWeight} kg</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Weekly Change</p>
                  <p className="text-2xl font-bold text-blue-400">{currentWeekPlan.projection.weeklyChange} kg</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Overall Progress</p>
                  <p className="text-2xl font-bold text-purple-400">{currentWeekPlan.projection.progress}</p>
                </div>
              </div>
            </div> */}

            {/* Week Tips */}
            {weekDetails && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-4">
                <div>
                  <p className="text-gray-400 text-sm font-semibold">💪 Workout Tip</p>
                  <p className="text-white mt-1">{weekDetails.workoutTips}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-semibold">🍽️ Diet Tip</p>
                  <p className="text-white mt-1">{weekDetails.dietTips}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-semibold">🎯 Motivation</p>
                  <p className="text-white mt-1 text-lg font-semibold">{weekDetails.motivationalMessage}</p>
                </div>

                {weekDetails.nextWeekPreview && (
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <p className="text-gray-400 text-sm font-semibold mb-2">👀 Next Week Preview</p>
                    <p className="text-white text-sm">
                      Workouts: {weekDetails.nextWeekPreview.intensity.workoutsPerWeek} | 
                      Duration: {weekDetails.nextWeekPreview.intensity.avgDurationMin}min | 
                      Calories: {weekDetails.nextWeekPreview.diet.calories}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressionPlan;
