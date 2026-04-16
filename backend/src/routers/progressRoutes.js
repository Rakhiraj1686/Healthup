import express from "express";
import { Protect } from "../middleware/authMiddleware.js";
import {
  logWeightEntry,
  logWorkoutCompletion,
  logDailyCheckInEntry,
  getStreakStats,
  getGoalProgressStats,
  getLatestProgressInsight,
  getWeeklyProgressAnalytics,
  getMonthlyProgressAnalytics,
  getGamificationBadges,
  getProgressDashboard,
  getMonthlyFitnessReportData,
  downloadMonthlyFitnessReportPdf,
  getWeightTimeline,
  getWeeklyOverviewGraph,
  getAdvancedAnalytics,
  getProgressionPlan,
  getWeekPlan,
} from "../controller/progressController.js";

const router = express.Router();

router.post("/weight", Protect, logWeightEntry);
router.post("/workouts", Protect, logWorkoutCompletion);
router.post("/checkin", Protect, logDailyCheckInEntry);
router.get("/timeline/weight", Protect, getWeightTimeline);
router.get("/streak", Protect, getStreakStats);
router.get("/goal-progress", Protect, getGoalProgressStats);
router.get("/insights/latest", Protect, getLatestProgressInsight);
router.get("/analytics/weekly", Protect, getWeeklyProgressAnalytics);
router.get("/analytics/monthly", Protect, getMonthlyProgressAnalytics);
router.get("/analytics/advanced", Protect, getAdvancedAnalytics);
router.get("/plan/progression", Protect, getProgressionPlan);
router.get("/plan/week/:week", Protect, getWeekPlan);
router.get("/badges", Protect, getGamificationBadges);
router.get("/dashboard", Protect, getProgressDashboard);
router.get("/report/monthly", Protect, getMonthlyFitnessReportData);
router.get("/report/monthly/pdf", Protect, downloadMonthlyFitnessReportPdf);
router.get("/overview-graph", Protect, getWeeklyOverviewGraph);

export default router;
