export const clampPercent = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 0;
  return Math.min(100, Math.max(0, numeric));
};

export const normalizeDate = (inputDate = new Date()) => {
  const date = new Date(inputDate);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const getWeekKey = (dateInput) => {
  const date = normalizeDate(dateInput);
  const year = date.getUTCFullYear();
  const firstDay = new Date(Date.UTC(year, 0, 1));
  const dayOffset = Math.floor((date - firstDay) / 86400000);
  const week = Math.ceil((dayOffset + firstDay.getUTCDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
};

export const getMonthKey = (dateInput) => {
  const date = normalizeDate(dateInput);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

export const daysBetween = (fromDate, toDate) => {
  const from = normalizeDate(fromDate);
  const to = normalizeDate(toDate);
  return Math.floor((to - from) / 86400000);
};

export const calculateGoalProgressPercent = ({
  goalType,
  startWeight,
  targetWeight,
  currentWeight,
}) => {
  const start = Number(startWeight);
  const target = Number(targetWeight);
  const current = Number(currentWeight);

  if ([start, target, current].some(Number.isNaN)) return 0;

  if (goalType === "weight_loss") {
    const total = Math.max(start - target, 0.01);
    const done = Math.max(start - current, 0);
    return clampPercent((done / total) * 100);
  }

  if (goalType === "muscle_gain") {
    const total = Math.max(target - start, 0.01);
    const done = Math.max(current - start, 0);
    return clampPercent((done / total) * 100);
  }

  const drift = Math.abs(current - target);
  return clampPercent(100 - drift * 10);
};

export const detectPlateau = (weightSeries = []) => {
  if (weightSeries.length < 21) {
    return { plateau: false, reason: "insufficient_data" };
  }

  const recent = weightSeries.slice(-21);
  const minWeight = Math.min(...recent);
  const maxWeight = Math.max(...recent);

  if (maxWeight - minWeight < 0.4) {
    return { plateau: true, reason: "low_variance_21_days" };
  }

  return { plateau: false, reason: "normal_variance" };
};
