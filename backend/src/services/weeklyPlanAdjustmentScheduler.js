import User from "../model/userProfileModel.js";
import { runWeeklyPlanAdjustmentForUser } from "./planAdjustmentService.js";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const getNextMondayTwoAm = () => {
  const now = new Date();
  const next = new Date(now);

  // Monday = 1, Sunday = 0 (JS date convention)
  const day = next.getDay();
  const daysUntilMonday = day === 0 ? 1 : (8 - day) % 7;

  next.setDate(next.getDate() + daysUntilMonday);
  next.setHours(2, 0, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 7);
  }

  return next;
};

const runAutomationCycle = async () => {
  const users = await User.find({ isActive: true }).select("_id");
  if (!users.length) {
    console.log("[PlanAutomation] No active users found for weekly evaluation.");
    return;
  }

  let updatedCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    try {
      // Each user is evaluated against weekly triggers (loss rate, adherence, stagnant gain).
      const result = await runWeeklyPlanAdjustmentForUser(user._id);
      if (result.updated) {
        updatedCount += 1;
      } else {
        skippedCount += 1;
      }
    } catch (error) {
      console.log(`[PlanAutomation] Failed for user ${user._id}:`, error.message);
    }
  }

  console.log(
    `[PlanAutomation] Weekly cycle complete. Updated: ${updatedCount}, Skipped: ${skippedCount}`,
  );
};

export const startWeeklyPlanAdjustmentScheduler = () => {
  const nextRunAt = getNextMondayTwoAm();
  const initialDelay = Math.max(nextRunAt.getTime() - Date.now(), 1000);

  console.log(`[PlanAutomation] First weekly run scheduled at ${nextRunAt.toISOString()}`);

  setTimeout(() => {
    runAutomationCycle().catch((error) => {
      console.log("[PlanAutomation] Initial weekly cycle failed:", error.message);
    });

    setInterval(() => {
      runAutomationCycle().catch((error) => {
        console.log("[PlanAutomation] Scheduled weekly cycle failed:", error.message);
      });
    }, ONE_WEEK_MS);
  }, initialDelay);
};
