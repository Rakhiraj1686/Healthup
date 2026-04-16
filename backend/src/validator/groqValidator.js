export const allowedTypes = [
  "WORKOUT_PLAN",
  "DIET_PLAN",
  "PROGRESS_ANALYSIS",
  "WEIGHT_FORECAST",
  "HABIT_SCORE_FEEDBACK",
  "PLATEAU_ANALYSIS",
  "FATIGUE_ADJUSTMENT",
  "CALORIE_ADJUSTMENT",
  "PROTEIN_RECOMMENDATION",
  "CARDIO_ADJUSTMENT",
  "RECOVERY_SUGGESTION",
  "GOAL_TIMELINE_ESTIMATION",
];

export const validateAIRequest = (req, res, next) => {
  const { type } = req.body;

  if (!type || !allowedTypes.includes(type)) {
    const error = new Error("HealthUP AI only accepts structured fitness requests.");
    error.statusCode = 400;
    return next(error);
  }
  next();
};
