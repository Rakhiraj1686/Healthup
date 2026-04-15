import api from "../config/Api"

export const getProgressDashboard = async () => {
  const res = await api.get("/api/v1/progress/dashboard");
  return res.data?.data;
};

export const getProgressOverviewGraph = async () => {
  const res = await api.get("/api/v1/progress/overview-graph");
  return res.data?.graphData || [];
};

export const logWeight = async (payload) => {
  const res = await api.post("/api/v1/progress/weight", payload);
  return res.data;
};

export const logWorkout = async (payload) => {
  const res = await api.post("/api/v1/progress/workouts", payload);
  return res.data;
};

export const logDailyCheckin = async (payload) => {
  const res = await api.post("/api/v1/progress/checkin", payload);
  return res.data;
};

export const refreshInsight = async () => {
  const res = await api.get("/api/v1/progress/insights/latest?force=true");
  return res.data?.data;
};

export const getMonthlyFitnessReport = async (monthKey) => {
  const query = monthKey ? `?monthKey=${monthKey}` : "";
  const res = await api.get(`/api/v1/progress/report/monthly${query}`);
  return res.data?.data;
};

export const downloadMonthlyFitnessReportPdf = async (monthKey) => {
  const query = monthKey ? `?monthKey=${monthKey}` : "";
  const res = await api.get(`/api/v1/progress/report/monthly/pdf${query}`, {
    responseType: "blob",
  });
  return res.data;
};
