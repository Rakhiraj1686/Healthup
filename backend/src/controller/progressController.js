import PDFDocument from "pdfkit";
import {
  logWeight,
  logDailyCheckIn,
  trackWorkoutCompletion,
  getStreak,
  getGoalProgress,
  getLatestInsight,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getUserBadges,
  getDashboardSnapshot,
  getWeightHistory,
  generateRuleBasedInsight,
  getMonthlyFitnessReport,
} from "../services/progressService.js";
import { getAllAdvancedAnalytics } from "../services/advancedAnalyticsService.js";
import { generate8WeekPlan, getWeekRecommendations } from "../services/progressionPlanService.js";
import DailyProgress from "../model/DailyProgress.js";
import { normalizeDate } from "../utils/progressUtils.js";

export const logWeightEntry = async (req, res, next) => {
  try {
    const { date, timezone, goalType, weightKg } = req.body;

    if (weightKg === undefined || weightKg === null) {
      const error = new Error("weightKg is required");
      error.statusCode = 400;
      return next(error);
    }

    const record = await logWeight({
      userId: req.user._id,
      date: date || new Date(),
      timezone,
      goalType,
      weightKg,
    });

    res.status(201).json({ success: true, message: "Weight logged", data: record });
  } catch (error) {
    next(error);
  }
};

export const logWorkoutCompletion = async (req, res, next) => {
  try {
    const { planWorkoutId, scheduledDate, status, durationMin, effortRpe } = req.body;

    if (!status) {
      const error = new Error("status is required");
      error.statusCode = 400;
      return next(error);
    }

    const data = await trackWorkoutCompletion({
      userId: req.user._id,
      planWorkoutId,
      scheduledDate: scheduledDate || new Date(),
      status,
      durationMin,
      effortRpe,
    });

    res.status(201).json({
      success: true,
      message: "Workout log updated",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const logDailyCheckInEntry = async (req, res, next) => {
  try {
    const {
      date,
      timezone,
      caloriesIn,
      proteinG,
      steps,
      dietAdherencePercent,
      habitAdherencePercent,
      energyLevel,
      waistCm,
      chestCm,
      hipsCm,
      armsCm,
      thighsCm,
    } = req.body;

    const data = await logDailyCheckIn({
      userId: req.user._id,
      date: date || new Date(),
      timezone,
      caloriesIn,
      proteinG,
      steps,
      dietAdherencePercent,
      habitAdherencePercent,
      energyLevel,
      waistCm,
      chestCm,
      hipsCm,
      armsCm,
      thighsCm,
    });

    res.status(201).json({
      success: true,
      message: "Daily check-in logged",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getStreakStats = async (req, res, next) => {
  try {
    const data = await getStreak(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getGoalProgressStats = async (req, res, next) => {
  try {
    const data = await getGoalProgress(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getLatestProgressInsight = async (req, res, next) => {
  try {
    const forceRefresh = req.query.force === "true";
    const data = forceRefresh
      ? await generateRuleBasedInsight(req.user._id)
      : await getLatestInsight(req.user._id);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyProgressAnalytics = async (req, res, next) => {
  try {
    const weeks = Number(req.query.weeks) || 8;
    const data = await getWeeklyAnalytics(req.user._id, weeks);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyProgressAnalytics = async (req, res, next) => {
  try {
    const months = Number(req.query.months) || 6;
    const data = await getMonthlyAnalytics(req.user._id, months);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getGamificationBadges = async (req, res, next) => {
  try {
    const data = await getUserBadges(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getWeightTimeline = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 90;
    const data = await getWeightHistory(req.user._id, days);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getProgressDashboard = async (req, res, next) => {
  try {
    const data = await getDashboardSnapshot(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyFitnessReportData = async (req, res, next) => {
  try {
    const monthKey = req.query.monthKey;
    const data = await getMonthlyFitnessReport(req.user._id, monthKey);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const downloadMonthlyFitnessReportPdf = async (req, res, next) => {
  try {
    const monthKey = req.query.monthKey;
    const report = await getMonthlyFitnessReport(req.user._id, monthKey);

    const fileName = `monthly-fitness-report-${report.monthKey}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);

    const pageWidth = 612;
    const pageHeight = 680;
    const doc = new PDFDocument({
      margin: 40,
      size: [pageWidth, pageHeight],
      autoFirstPage: false,
    });
    doc.addPage();
    doc.pipe(res);

    const measurement = report.metrics?.measurementChange || {};
    const toText = (value, unit = "") => {
      if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "--";
      }
      const numeric = Number(value);
      const prefix = numeric > 0 ? "+" : "";
      return `${prefix}${numeric.toFixed(2)}${unit}`;
    };

    const contentWidth = pageWidth - 80;

    const drawHeader = () => {
      doc
        .roundedRect(50, 45, contentWidth, 72, 12)
        .fillAndStroke("#EEF2FF", "#CBD5E1");

      doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(20).text("Monthly Fitness Report", 68, 62);
      doc
        .fillColor("#475569")
        .font("Helvetica")
        .fontSize(10)
        .text(`Month: ${report.monthKey}   •   Data Points: ${report.dataPoints}`, 68, 88);
    };

    const drawMetricCard = (x, y, label, value, accent = "#2563EB") => {
      const cardWidth = 160;
      const cardHeight = 72;
      doc.roundedRect(x, y, cardWidth, cardHeight, 8).fillAndStroke("#FFFFFF", "#E2E8F0");
      doc.rect(x, y, 4, cardHeight).fill(accent);
      doc
        .fillColor("#64748B")
        .font("Helvetica")
        .fontSize(9)
        .text(label, x + 12, y + 12, { width: cardWidth - 20 });
      doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(value, x + 12, y + 34, { width: cardWidth - 20 });
    };

    const drawTable = (startY) => {
      const tableX = 50;
      const tableWidth = contentWidth;
      const rowHeight = 30;
      const colWidth = tableWidth / 5;

      doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(13)
        .text("Measurement Change (cm)", tableX, startY);

      const headerY = startY + 24;
      const valueY = headerY + rowHeight;

      doc.rect(tableX, headerY, tableWidth, rowHeight).fillAndStroke("#F8FAFC", "#CBD5E1");
      doc.rect(tableX, valueY, tableWidth, rowHeight).fillAndStroke("#FFFFFF", "#E2E8F0");

      const labels = ["Waist", "Chest", "Hips", "Arms", "Thighs"];
      const values = [
        toText(measurement.waistCm, " cm"),
        toText(measurement.chestCm, " cm"),
        toText(measurement.hipsCm, " cm"),
        toText(measurement.armsCm, " cm"),
        toText(measurement.thighsCm, " cm"),
      ];

      for (let index = 0; index < labels.length; index += 1) {
        const x = tableX + index * colWidth;
        if (index > 0) {
          doc.moveTo(x, headerY).lineTo(x, valueY + rowHeight).strokeColor("#E2E8F0").stroke();
        }

        doc
          .fillColor("#475569")
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(labels[index], x + 8, headerY + 9, { width: colWidth - 16, align: "center" });

        doc
          .fillColor("#0F172A")
          .font("Helvetica")
          .fontSize(10)
          .text(values[index], x + 8, valueY + 9, { width: colWidth - 16, align: "center" });
      }
    };

    drawHeader();

    const metricsStartY = 145;
    drawMetricCard(50, metricsStartY, "Weight Change", toText(report.metrics?.weightChangeKg, " kg"), "#2563EB");
    drawMetricCard(225, metricsStartY, "Habit Score Avg", toText(report.metrics?.habitScoreAverage, "%"), "#16A34A");
    drawMetricCard(400, metricsStartY, "Goal Progress", toText(report.metrics?.goalProgressPercent, "%"), "#7C3AED");

    drawMetricCard(50, metricsStartY + 86, "Workout Adherence", toText(report.metrics?.workoutAdherencePercent, "%"), "#0891B2");
    drawMetricCard(225, metricsStartY + 86, "Diet Adherence", toText(report.metrics?.dietAdherencePercent, "%"), "#EA580C");
    drawMetricCard(400, metricsStartY + 86, "Export Type", "PDF Summary", "#0EA5E9");

    drawTable(metricsStartY + 188);

    doc
      .fillColor("#64748B")
      .font("Helvetica")
      .fontSize(9)
      .text("Generated by HealthUP Enhanced Reporting", 50, 626, {
        width: contentWidth,
        align: "left",
      })
      .text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 50, 640, {
        width: contentWidth,
        align: "left",
      });

    doc.end();
  } catch (error) {
    next(error);
  }
};

export const getWeeklyOverviewGraph = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 56;
    const startDate = normalizeDate(new Date(Date.now() - days * 86400000));
    const rows = await DailyProgress.find({
      user: req.user._id,
      date: { $gte: startDate },
    })
      .sort({ date: 1 })
      .select("date adherenceScore dietAdherencePercent habitAdherencePercent workoutsPlanned workoutsCompleted");

    const dailyMap = new Map();

    rows.forEach((row) => {
      const date = normalizeDate(row.date);
      const isoDate = date.toISOString().slice(0, 10);
      const dateLabel = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      if (!dailyMap.has(isoDate)) {
        dailyMap.set(isoDate, {
          date: isoDate,
          dateLabel,
          workout: 0,
          diet: 0,
          habit: 0,
          points: 0,
        });
      }

      const item = dailyMap.get(isoDate);
      item.points += 1;
      item.diet += row.dietAdherencePercent ?? row.adherenceScore ?? 0;
      item.habit += row.habitAdherencePercent ?? row.adherenceScore ?? 0;
      item.workout += row.workoutsPlanned
        ? ((row.workoutsCompleted || 0) / row.workoutsPlanned) * 100
        : 0;
    });

    const graphData = Array.from(dailyMap.values())
      .map((entry) => ({
        date: entry.date,
        dateLabel: entry.dateLabel,
        workout: Number((entry.workout / Math.max(entry.points, 1)).toFixed(2)),
        diet: Number((entry.diet / Math.max(entry.points, 1)).toFixed(2)),
        habit: Number((entry.habit / Math.max(entry.points, 1)).toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({ success: true, graphData });
  } catch (error) {
    next(error);
  }
};

export const getAdvancedAnalytics = async (req, res, next) => {
  try {
    const weeks = Number(req.query.weeks) || 8;
    const data = await getAllAdvancedAnalytics(req.user._id, weeks);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getProgressionPlan = async (req, res, next) => {
  try {
    const weeks = Number(req.query.weeks) || 8;
    const data = await generate8WeekPlan(req.user._id, weeks);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getWeekPlan = async (req, res, next) => {
  try {
    const week = Number(req.params.week);
    if (!week || week < 1 || week > 8) {
      const error = new Error("Week must be between 1 and 8");
      error.statusCode = 400;
      return next(error);
    }
    const data = await getWeekRecommendations(req.user._id, week);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
