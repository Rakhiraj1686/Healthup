import "dotenv/config";
import mongoose from "mongoose";
import DailyProgress from "../model/DailyProgress.js";
import { normalizeDate, getWeekKey, getMonthKey } from "../utils/progressUtils.js";

const toNumberOrUndefined = (value) => {
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in environment");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected for migration");

  const hasLegacyCollection = await mongoose.connection.db
    .listCollections({ name: "progresses" })
    .hasNext();

  if (!hasLegacyCollection) {
    console.log("No legacy 'progresses' collection found. Nothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  const legacyCollection = mongoose.connection.collection("progresses");
  const cursor = legacyCollection.find({});

  let scanned = 0;
  let migrated = 0;
  let failed = 0;

  for await (const doc of cursor) {
    scanned += 1;

    try {
      if (!doc.user) {
        failed += 1;
        continue;
      }

      const date = normalizeDate(doc.date || doc.createdAt || new Date());

      const setFields = {
        weekKey: getWeekKey(date),
        monthKey: getMonthKey(date),
      };

      const workoutAdherencePercent = toNumberOrUndefined(doc.workoutAdherencePercent);
      if (workoutAdherencePercent !== undefined) {
        setFields.workoutAdherencePercent = workoutAdherencePercent;
      }

      const dietAdherencePercent = toNumberOrUndefined(doc.dietAdherencePercent);
      if (dietAdherencePercent !== undefined) {
        setFields.dietAdherencePercent = dietAdherencePercent;
      }

      const habitScore = toNumberOrUndefined(doc.habitScore);
      if (habitScore !== undefined) {
        setFields.habitScore = habitScore;
      }

      const weight = toNumberOrUndefined(doc.weight);
      if (weight !== undefined) {
        setFields.weight = weight;
      }

      const bmi = toNumberOrUndefined(doc.bmi);
      if (bmi !== undefined) {
        setFields.bmi = bmi;
      }

      const bodyFat = toNumberOrUndefined(doc.bodyFat);
      if (bodyFat !== undefined) {
        setFields.bodyFat = bodyFat;
      }

      await DailyProgress.updateOne(
        { user: doc.user, date },
        {
          $setOnInsert: {
            user: doc.user,
            date,
            timezone: "UTC",
            goalType: "maintenance",
            workoutsPlanned: 0,
            workoutsCompleted: 0,
            habitAdherencePercent: 0,
            adherenceScore: 0,
          },
          $set: setFields,
        },
        { upsert: true },
      );

      migrated += 1;
    } catch (error) {
      failed += 1;
      console.error(`Failed to migrate doc ${doc?._id}:`, error.message);
    }
  }

  console.log("Migration summary:", { scanned, migrated, failed });
  await mongoose.disconnect();
};

run()
  .then(() => {
    console.log("Progress migration completed.");
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Progress migration failed:", error);
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors in failure path.
    }
    process.exit(1);
  });
