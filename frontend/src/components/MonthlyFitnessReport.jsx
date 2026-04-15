import { useEffect, useMemo, useState } from "react";
import {
  downloadMonthlyFitnessReportPdf,
  getMonthlyFitnessReport,
} from "../config/progressApi";

const toMonthKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const formatDelta = (value, unit = "") => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  const numeric = Number(value);
  const prefix = numeric > 0 ? "+" : "";
  return `${prefix}${numeric.toFixed(2)}${unit}`;
};

const getValueTone = (value, positiveClass, neutralClass = "text-gray-300") => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return neutralClass;
  }
  return Number(value) >= 0 ? positiveClass : "text-red-300";
};

const MonthlyFitnessReport = ({ refreshSignal = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [monthKey, setMonthKey] = useState(toMonthKey());
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const monthInputValue = useMemo(() => monthKey, [monthKey]);

  const loadReport = async (targetMonthKey = monthKey) => {
    setLoading(true);
    setError("");
    try {
      const data = await getMonthlyFitnessReport(targetMonthKey);
      setReport(data || null);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load monthly report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(monthKey);
  }, [monthKey, refreshSignal]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const blob = await downloadMonthlyFitnessReportPdf(monthKey);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `monthly-fitness-report-${monthKey || toMonthKey()}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      setError(downloadError?.response?.data?.message || "Failed to download PDF report");
    } finally {
      setDownloading(false);
    }
  };

  const metricCards = report
    ? [
        {
          label: "Weight Change",
          value: formatDelta(report?.metrics?.weightChangeKg, " kg"),
          tone: getValueTone(report?.metrics?.weightChangeKg, "text-blue-300"),
          helper: "Start vs latest weight in selected month",
        },
        {
          label: "Habit Score Avg",
          value: formatDelta(report?.metrics?.habitScoreAverage, "%"),
          tone: getValueTone(report?.metrics?.habitScoreAverage, "text-green-300"),
          helper: "Average monthly consistency score",
        },
        {
          label: "Goal Progress",
          value: formatDelta(report?.metrics?.goalProgressPercent, "%"),
          tone: getValueTone(report?.metrics?.goalProgressPercent, "text-purple-300"),
          helper: "Overall target completion percent",
        },
        {
          label: "Workout Adherence",
          value: formatDelta(report?.metrics?.workoutAdherencePercent, "%"),
          tone: getValueTone(report?.metrics?.workoutAdherencePercent, "text-cyan-300"),
          helper: "Completed vs planned workouts",
        },
        {
          label: "Diet Adherence",
          value: formatDelta(report?.metrics?.dietAdherencePercent, "%"),
          tone: getValueTone(report?.metrics?.dietAdherencePercent, "text-orange-300"),
          helper: "Average daily diet adherence",
        },
      ]
    : [];

  return (
    <section className="mb-6 sm:mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="border-b border-white/10 bg-white/5 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-bold text-white sm:text-2xl">Monthly Fitness Report</h3>
            <p className="mt-1 text-xs text-gray-400 sm:text-sm">
              Monthly snapshot for weight, adherence, measurement shifts, and goal movement.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="month"
              value={monthInputValue}
              onChange={(event) => setMonthKey(event.target.value)}
              className="rounded-lg border border-white/10 bg-[#0F172A] px-3 py-2 text-sm text-white"
            />
            <button
              type="button"
              onClick={() => loadReport(monthKey)}
              disabled={loading}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Load Report"}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading || loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {downloading ? "Downloading..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {error && <p className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        {!error && report && (
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-gray-400">Selected Month</p>
              <p className="mt-1 text-base font-semibold text-white">{report.monthKey}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-gray-400">Data Points</p>
              <p className="mt-1 text-base font-semibold text-white">{report.dataPoints || 0} logs</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-gray-400">Downloadable Summary</p>
              <p className="mt-1 text-base font-semibold text-blue-300">Available (PDF)</p>
            </div>
          </div>
        )}

        {!loading && !error && report && (
          <>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {metricCards.map((card) => (
                <div key={card.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-gray-400">{card.label}</p>
                  {/* Metric value cards: quick monthly KPI view for reporting dashboard. */}
                  <p className={`mt-2 text-xl font-bold ${card.tone}`}>{card.value}</p>
                  <p className="mt-1 text-[11px] text-gray-500">{card.helper}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Measurement Change (cm)</p>
                <span className="text-xs text-gray-500">Start vs latest logged values</span>
              </div>
              {/* Measurement change table: body circumference trend indicators for monthly review. */}
              <table className="w-full text-sm text-gray-300">
                <thead className="border-b border-white/10 text-xs text-gray-400">
                  <tr>
                    <th className="py-2 text-left font-medium">Waist</th>
                    <th className="py-2 text-left font-medium">Chest</th>
                    <th className="py-2 text-left font-medium">Hips</th>
                    <th className="py-2 text-left font-medium">Arms</th>
                    <th className="py-2 text-left font-medium">Thighs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className={`py-2 ${getValueTone(report?.metrics?.measurementChange?.waistCm, "text-blue-300")}`}>
                      {formatDelta(report?.metrics?.measurementChange?.waistCm, " cm")}
                    </td>
                    <td className={`py-2 ${getValueTone(report?.metrics?.measurementChange?.chestCm, "text-blue-300")}`}>
                      {formatDelta(report?.metrics?.measurementChange?.chestCm, " cm")}
                    </td>
                    <td className={`py-2 ${getValueTone(report?.metrics?.measurementChange?.hipsCm, "text-blue-300")}`}>
                      {formatDelta(report?.metrics?.measurementChange?.hipsCm, " cm")}
                    </td>
                    <td className={`py-2 ${getValueTone(report?.metrics?.measurementChange?.armsCm, "text-blue-300")}`}>
                      {formatDelta(report?.metrics?.measurementChange?.armsCm, " cm")}
                    </td>
                    <td className={`py-2 ${getValueTone(report?.metrics?.measurementChange?.thighsCm, "text-blue-300")}`}>
                      {formatDelta(report?.metrics?.measurementChange?.thighsCm, " cm")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {loading && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-gray-400">
            Loading monthly fitness report...
          </div>
        )}

        {!loading && !error && !report && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-gray-400">
            No monthly report data available.
          </div>
        )}
      </div>
    </section>
  );
};

export default MonthlyFitnessReport;
