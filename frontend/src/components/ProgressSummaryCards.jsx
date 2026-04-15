const Card = ({ title, value, subtitle, status }) => {
  let statusColor = "text-gray-400";
  if (status === "under") statusColor = "text-blue-400";
  else if (status === "over") statusColor = "text-red-400";
  else if (status === "perfect") statusColor = "text-green-400";
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {subtitle && <p className={`text-xs ${statusColor} mt-1`}>{subtitle}</p>}
    </div>
  );
};

const ProgressSummaryCards = ({ dashboard, calorieTarget: calorieTargetProp }) => {
  const goal = dashboard?.goal || {};

  // Calculate calorie status (assuming we'll track this later)
  const calorieTarget = calorieTargetProp || goal.calorieTarget || 2000;
  const workoutsPerWeek = goal.workoutsPerWeek || 5;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card
        title="Goal Progress"
        value={`${Number(goal.progressPercent || 0).toFixed(1)}%`}
        subtitle={(goal.goalType || "maintenance").replace("_", " ")}
      />
      <Card
        title="Current Weight"
        value={goal.currentWeight ? `${goal.currentWeight} kg` : "--"}
        subtitle={goal.targetWeight ? `Target ${goal.targetWeight} kg` : "Set a target in Goal"}
      />
      <Card
        title="Calorie Target"
        value={`${calorieTarget} kcal`}
        subtitle="Daily calorie goal"
        status="under"
      />
      <Card
        title="Weekly Workout Goal"
        value={`${workoutsPerWeek} days`}
        subtitle="Target workouts per week"
      />
    </div>
  );
};

export default ProgressSummaryCards;
