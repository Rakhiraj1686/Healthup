import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/Api";
import toast from "react-hot-toast";
import PlanAdjustmentPanel from "./PlanAdjustmentPanel";

const UserPlan = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("diet");
  const [generatingType, setGeneratingType] = useState(null);

  const emptyDietPlan = {
    calories: 0,
    macros: { protein: 0, carbs: 0, fats: 0 },
    meals: [],
  };

  const emptyWorkoutPlan = {
    weekStartDate: new Date(),
    level: "--",
    days: [],
  };

  const [dietPlan, setDietPlan] = useState({
    ...emptyDietPlan,
  });

  const [workoutPlan, setWorkoutPlan] = useState({
    ...emptyWorkoutPlan,
  });

  const applyAIPlanToState = (plan) => {
    if (!plan) return;

    if (plan.calories || plan.macros || plan.meals) {
      setDietPlan((prev) => ({
        ...prev,
        calories: Number(plan.calories || prev.calories || 0),
        macros: {
          protein: Number(plan?.macros?.protein || prev?.macros?.protein || 0),
          carbs: Number(plan?.macros?.carbs || prev?.macros?.carbs || 0),
          fats: Number(plan?.macros?.fats || prev?.macros?.fats || 0),
        },
        meals:
          Array.isArray(plan.meals) && plan.meals.length > 0
            ? plan.meals
            : prev.meals,
      }));
    }

    if (Array.isArray(plan.workoutDays) && plan.workoutDays.length > 0) {
      setWorkoutPlan((prev) => ({
        ...prev,
        level: plan.workoutLevel || prev.level,
        days: plan.workoutDays,
      }));
    }
  };

  useEffect(() => {
    if (user?.aiPlan) {
      applyAIPlanToState(user.aiPlan);
    }
  }, [user?.aiPlan]);

  const handleGeneratePlan = async (planType = "all") => {
    if (!user?.primaryGoal && !user?.goal) {
      toast.error("Please set your fitness goal first!");
      return;
    }

    setGeneratingType(planType);
    try {
      const res = await api.post("/user/generatePlan", { planType });

      if (planType === "diet") {
        toast.success("AI diet plan generated successfully! 🎉");
      } else if (planType === "workout") {
        toast.success("AI workout plan generated successfully! 🎉");
      } else {
        toast.success("AI plan regenerated successfully! 🎉");
      }

      if (res.data.aiPlan) {
        applyAIPlanToState(res.data.aiPlan);

        const updatedUser = {
          ...user,
          aiPlan: res.data.aiPlan,
        };

        setUser(updatedUser);
        sessionStorage.setItem("HealthUP", JSON.stringify(updatedUser));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate AI plan");
    } finally {
      setGeneratingType(null);
    }
  };

  const hasDietPlan = Array.isArray(dietPlan.meals) && dietPlan.meals.length > 0;
  const hasWorkoutPlan = Array.isArray(workoutPlan.days) && workoutPlan.days.length > 0;

  return (
    <>
      <div className="min-h-screen p-6 mb-8">
        {/* Plan Adjustment Panel */}
        <PlanAdjustmentPanel />

        {/* Hero Section */}
        <div className="mb-10 bg-linear-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 border border-purple-500/30 rounded-3xl p-10 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-linear-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Your Personalized Plan
            </h1>
            <p className="text-gray-300 text-md mb-6">
              A customized diet and workout plan designed specifically for your
              goals. Stay consistent and watch the results!
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleGeneratePlan("diet")}
                disabled={Boolean(generatingType)}
                className="px-5 py-2.5 bg-linear-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {generatingType === "diet" ? " Generating Diet..." : " Generate Diet Plan"}
              </button>

              <button
                onClick={() => handleGeneratePlan("workout")}
                disabled={Boolean(generatingType)}
                className="px-5 py-2.5 bg-linear-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {generatingType === "workout" ? " Generating Workout..." : " Generate Workout Plan"}
              </button>

              <button
                onClick={() => handleGeneratePlan("all")}
                disabled={Boolean(generatingType)}
                className="px-5 py-2.5 bg-linear-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {generatingType === "all" ? " Regenerating..." : " Regenerate Full AI Plan"}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-5 mb-8 bg-white/5 p-2 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("diet")}
              className={`flex-1 py-2 rounded-lg font-semibold transition duration-300 ${
                activeTab === "diet"
                  ? "bg-linear-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white cursor-pointer"
              }`}
            >
              Diet Plan
            </button>

            <button
              onClick={() => setActiveTab("workout")}
              className={`flex-1 py-2 rounded-lg font-semibold transition duration-300 ${
                activeTab === "workout"
                  ? "bg-linear-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white cursor-pointer"
              }`}
            >
              Workout Plan
            </button>
          </div>

          {/* ================= DIET PLAN ================= */}
          {activeTab === "diet" && (
            <div className="space-y-6">
              {/* Nutrition Summary */}
              <div className="bg-linear-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                   Daily Nutrition Goals
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400 text-sm mb-1">Calories</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {dietPlan.calories}
                    </p>
                    <p className="text-xs text-gray-500">kcal</p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400 text-sm mb-1">Protein</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {dietPlan.macros.protein}g
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400 text-sm mb-1">Carbs</p>
                    <p className="text-2xl font-bold text-indigo-400">
                      {dietPlan.macros.carbs}g
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400 text-sm mb-1">Fats</p>
                    <p className="text-2xl font-bold text-purple-300">
                      {dietPlan.macros.fats}g
                    </p>
                  </div>
                </div>
              </div>

              {/* Meals */}
              <div className="space-y-4">
                {!hasDietPlan && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-gray-300">
                    No AI diet plan found. Click "Regenerate AI Plan" after updating your profile.
                  </div>
                )}

                {dietPlan.meals.map((meal, index) => (
                  <div
                    key={index}
                    className="bg-linear-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 hover:border-purple-500/50 transition duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-purple-300 mb-1">
                          {meal.mealName}
                        </h3>
                        <p className="text-sm text-gray-400"> {meal.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-400">
                          {meal.calories}
                        </p>
                        <p className="text-xs text-gray-400">kcal</p>
                      </div>
                    </div>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {meal.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-gray-300"
                        >
                          <span className="text-purple-400">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= WORKOUT PLAN ================= */}
          {activeTab === "workout" && (
            <div className="space-y-6">
              <div className="bg-linear-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-purple-400 mb-4">
                  Weekly Workout Schedule
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Level</p>
                    <p className="text-md font-bold text-purple-400">
                      {workoutPlan.level}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {!hasWorkoutPlan && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-gray-300">
                    No AI workout plan found. Click "Regenerate AI Plan" after updating your profile.
                  </div>
                )}

                {workoutPlan.days.map((day, index) => (
                  <div
                    key={index}
                    className="bg-linear-to-br from-white/10 to-white/5 border border-white/20 hover:border-purple-500/50 rounded-xl p-6 transition duration-300"
                  >
                    <h3 className="text-2xl font-bold text-purple-300 mb-1">
                      {day.dayName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Focus :
                      <span className="text-blue-400 font-semibold ml-2">
                        {day.focus}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserPlan;
