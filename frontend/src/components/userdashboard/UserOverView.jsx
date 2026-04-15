import React, { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProgressData } from "../../config/hooks/useProgressData";

const UserOverview = () => {
  const { user } = useAuth();
  const { dashboard, graphData, loading } = useProgressData();

  const goalData = dashboard?.goal || {};
  const streak = dashboard?.streak || { currentStreakDays: 0, longestStreakDays: 0 };

  const effectiveCalorieTarget = useMemo(() => {
    const profileCalories = Number(user?.aiPlan?.calories);
    if (Number.isFinite(profileCalories) && profileCalories > 0) {
      return profileCalories;
    }
    return Number(goalData?.calorieTarget) || 2000;
  }, [user?.aiPlan?.calories, goalData?.calorieTarget]);

  const progressData = useMemo(() => {
    const workoutsPlanned = Number(goalData?.workoutsPerWeek) || 5;
    const latestGraphPoint = graphData?.length ? graphData[graphData.length - 1] : null;
    const workoutPercent = Number(latestGraphPoint?.workout || 0);
    const workoutsCompleted = Math.round((workoutPercent / 100) * workoutsPlanned);

    return {
      workoutsCompleted,
      workoutsPlanned,
      caloriesIn: Math.round((Number(latestGraphPoint?.diet || 0) / 100) * effectiveCalorieTarget),
      proteinTarget: Number(user?.aiPlan?.macros?.protein || user?.macros?.protein || 0),
      adherenceScore: Number(latestGraphPoint?.habit || 0),
    };
  }, [goalData?.workoutsPerWeek, graphData, effectiveCalorieTarget, user?.aiPlan?.macros?.protein, user?.macros?.protein]);

  const getWorkoutStatus = () => {
    if (!progressData?.workoutsCompleted)
      return "No workouts completed yet. Start today 💪";
    return `${progressData.workoutsCompleted} of ${progressData.workoutsPlanned} workouts completed.`;
  };

  const getNutritionStatus = () => {
    if (!progressData?.caloriesIn) return "Log meals to track your nutrition.";
    const target = effectiveCalorieTarget;
    const diff = target - progressData.caloriesIn;

    if (diff > 0) {
      return `${diff} kcal remaining. Protein Target: ${progressData.proteinTarget}g`;
    } else if (diff < 0) {
      return `${Math.abs(diff)} kcal over target! Protein Target: ${progressData.proteinTarget}g`;
    } else {
      return `Perfect! Target met. Protein Target: ${progressData.proteinTarget}g`;
    }
  };

  const getCalorieStatus = () => {
    const caloriesIn = progressData?.caloriesIn || 0;
    const target = effectiveCalorieTarget;

    if (caloriesIn < target) {
      return { status: "under", message: "Under Target", color: "blue" };
    } else if (caloriesIn > target) {
      return { status: "over", message: "Over Target", color: "red" };
    } else {
      return { status: "perfect", message: "Perfect!", color: "green" };
    }
  };

  const getStreakColor = (days) => {
    if (!days) return "gray";
    if (days >= 14) return "green";
    if (days >= 7) return "yellow";
    return "red";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-20 md:py-8 md:px-6">
      {user?.profileCompleted ? (
        <main className="md:max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold md:text-4xl md:font-bold">
              Welcome back, {user?.fullName?.split(" ")[0]} 👋
            </h1>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Stat
              title="Workout Streak"
              value={`${streak?.currentStreakDays || 0} Days`}
              subtitle={`Best: ${streak?.longestStreakDays || 0} days`}
              color={getStreakColor(streak?.currentStreakDays)}
              icon="🔥"
            />
            <Stat
              title="Calories Today"
              value={`${progressData?.caloriesIn || 0} kcal`}
              subtitle={`Target: ${effectiveCalorieTarget} | ${getCalorieStatus().message}`}
              color={getCalorieStatus().color}
              icon="🍽️"
            />
            <Stat
              title="Target Workouts"
              value={`${goalData?.workoutsPerWeek || 5}/week`}
              subtitle={`${progressData?.workoutsCompleted || 0} completed this week`}
              color="purple"
              icon="💪"
            />
            <Stat
              title="Habit Adherence"
              value={`${progressData?.adherenceScore || 0}%`}
              subtitle={`${progressData?.workoutsCompleted || 0} workouts`}
              color={progressData?.adherenceScore >= 75 ? "green" : "yellow"}
              icon="✅"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <GlassCard
              title="🏋️ Today's Workout"
              desc={getWorkoutStatus()}
              planned={progressData?.workoutsPlanned}
              completed={progressData?.workoutsCompleted}
            />
            <GlassCard
              title="🥗 Nutrition Summary"
              desc={getNutritionStatus()}
              calories={progressData?.caloriesIn}
              target={effectiveCalorieTarget}
            />
          </div>
        </main>
      ) : (
        <div className="text-center text-gray-400">
          Please complete your profile to unlock your dashboard.
        </div>
      )}
    </div>
  );
};

export default UserOverview;

/* ---------- SMALL COMPONENTS ---------- */

const Stat = ({ title, value, subtitle, color, icon }) => {
  const colorClasses = {
    purple: "text-purple-400",
    blue: "text-blue-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    gray: "text-gray-400",
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow">
      <div className="flex justify-between mb-3">
        <h3 className="text-gray-400 text-sm">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p
        className={`text-3xl font-bold ${colorClasses[color] || "text-blue-400"}`}
      >
        {value}
      </p>
      {subtitle && <p className="text-gray-500 text-xs mt-2">{subtitle}</p>}
    </div>
  );
};

const GlassCard = ({ title, desc, planned, completed, calories, target }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <p className="text-gray-300 text-sm mb-4">{desc}</p>

    {planned !== undefined && (
      <>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Progress</span>
          <span>
            {completed}/{planned}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full"
            style={{
              width: `${planned > 0 ? (completed / planned) * 100 : 0}%`,
            }}
          />
        </div>
      </>
    )}

    {calories !== undefined && (
      <>
        <div className="flex justify-between text-xs text-gray-400 mb-2 mt-4">
          <span>Calorie Intake</span>
          <span>
            {calories}/{target}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{
              width: `${target > 0 ? Math.min((calories / target) * 100, 100) : 0}%`,
            }}
          />
        </div>
      </>
    )}
  </div>
);
