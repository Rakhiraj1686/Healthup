import bcrypt from "bcrypt";
import User from "../model/userProfileModel.js";
import { buildPrompt } from "../services/groqPromptBuilder.js";
import { getAIResponse, getExtendedAIResponse } from "../services/groqServices.js";
import cloudinary from "../config/cloudinary.js";
import { generatePersonalizedAIPlan } from "../services/aiPlanService.js";
import {
  runWeeklyPlanAdjustmentForUser,
} from "../services/planAdjustmentService.js";
import Ticket from "../model/ticketModel.js";
import Progress from "../model/DailyProgress.js";
import UserGoalLog from "../model/userGoal.js";
import {
  calculateBMR,
  calculateMaintenanceCalories,
  calculateTargetCalories,
  generateMacros,
} from "../utils/fitnessCalculation.js"
import {
  buildAdvancedMacroCustomization,
  buildMealSwapEngine,
  buildPersonalizedMealAdjustments,
  buildDeeperRecoveryInsights,
  getPremiumCoachingLayerData,
} from "../services/premiumCoachingService.js";
import DailyProgress from "../model/DailyProgress.js";
import WorkoutLog from "../model/WorkoutLog.js";

const getWeekStartDate = (date = new Date()) => {
  const current = new Date(date);
  const day = current.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diffToMonday);
  current.setHours(0, 0, 0, 0);
  return current;
};

export const UserResetPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const currentUser = req.user;

    if (!oldPassword || !newPassword) {
      const error = new Error("All fields required.");
      error.statusCode = 400;
      return next(error);
    }

    const isVerified = await bcrypt.compare(oldPassword, currentUser.password);
    if (!isVerified) {
      const error = new Error("Old Password didn't matched");
      error.statusCode = 401;
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    currentUser.password = hashPassword;

    await currentUser.save();

    res.status(200).json({ message: "Password reset succeful." });
  } catch (error) {
    next(error);
  }
};

export const UserUpdateProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      age,
      height,
      weight,
      biologicalSex,
      foodPreference,
      workoutPreference,
      activityLevel,
      experienceLevel,
      goal,
    } = req.body;

    const currentUser = req.user;

    if (!fullName || !email || !mobileNumber) {
      const error = new Error(
        "Full name, email and mobile number are required.",
      );
      error.statusCode = 400;
      return next(error);
    }

    // Convert to numbers
    const numAge = Number(age);
    const numHeight = Number(height);
    const numWeight = Number(weight);

    // BMI
    let bmi = null;
    if (numHeight && numWeight) {
      const heightMeter = numHeight / 100;
      bmi = Number((numWeight / (heightMeter * heightMeter)).toFixed(2));
    }

    // ---- CALCULATIONS ----
    const bmr = calculateBMR({
      weight: numWeight,
      height: numHeight,
      age: numAge,
      biologicalSex,
    });

    const maintenanceCalories = calculateMaintenanceCalories(
      bmr,
      activityLevel,
    );

    const targetCalories = calculateTargetCalories({
      maintenanceCalories,
      goal,
    });

    const macros = generateMacros({
      weight: numWeight,
      goal,
      targetCalories,
    });

    // ---- SAVE USER ----
    currentUser.fullName = fullName;
    currentUser.email = email;
    currentUser.mobileNumber = mobileNumber;
    currentUser.age = numAge;
    currentUser.height = numHeight;
    currentUser.weight = numWeight;
    currentUser.biologicalSex = biologicalSex;
    currentUser.activityLevel = activityLevel;
    currentUser.experienceLevel = experienceLevel;
    currentUser.foodPreference = foodPreference || currentUser.foodPreference;
    currentUser.workoutPreference = workoutPreference || currentUser.workoutPreference;
    currentUser.goal = goal || currentUser.goal || "maintain";

    currentUser.bmi = bmi;
    currentUser.bmr = bmr;
    currentUser.maintenanceCalories = maintenanceCalories;
    currentUser.targetCalories = targetCalories;
    currentUser.macros = macros;

    // Generate AI Plan
    const plan = await generatePersonalizedAIPlan(currentUser);
    currentUser.aiPlan = plan;

    currentUser.profileCompleted = true;

    await currentUser.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      data: currentUser,
    });
  } catch (error) {
    next(error);
  }
};

export const UserChangePhoto = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const photo = req.file;

    if (!req.file) {
      const error = new Error("No file uploaded");
      error.statusCode = 400;
      return next(error);
    }

    if (currentUser.photo.publicID) {
      await cloudinary.uploader.destroy(currentUser.photo.publicID);
    }

    const b64 = Buffer.from(photo.buffer).toString("base64");
    const dataURI = `data:${photo.mimetype};base64,${b64}`;
    const uploadRes = await cloudinary.uploader.upload(dataURI, {
      folder: "HealthUP/UserProfile",
      width: 500,
      height: 500,
      crop: "fill",
    });

    console.log("Image Upload Done ");
    currentUser.photo = {
      url: uploadRes.secure_url,
      publicID: uploadRes.public_id,
    };
    await currentUser.save();

    res.status(200).json({
      message: "Profile photo updated successfully.",
      data: currentUser,
    });
  } catch (error) {
    next(error);
  }
};

export const UserSetGoal = async (req, res, next) => {
  try {
    const { primaryGoal, calorieTarget, goalWeight, goalStatus } = req.body;
    const currentUser = req.user;

    if (!primaryGoal) {
      const error = new Error("Primary goal is required.");
      error.statusCode = 400;
      return next(error);
    }

    currentUser.primaryGoal = primaryGoal;
    if (calorieTarget) currentUser.calorieTarget = calorieTarget;
    if (goalWeight) currentUser.goalWeight = goalWeight;
    if (goalStatus) currentUser.goalStatus = goalStatus;

    await currentUser.save();

    res
      .status(200)
      .json({ message: "Goal updated successfully.", data: currentUser });
  } catch (error) {
    next(error);
  }
};

export const UserCompleteGoal = async (req, res, next) => {
  try {
    const currentUser = req.user;

    if (currentUser.goalStatus !== "ongoing") {
      const error = new Error("No ongoing goal to complete.");
      error.statusCode = 400;
      return next(error);
    }

    const historyEntry = await UserGoalLog.create({
      user: currentUser._id,
      weekStartDate: getWeekStartDate(new Date()),
      primaryGoal: currentUser.primaryGoal,
      calorieTarget: currentUser.calorieTarget,
      goalWeight: currentUser.goalWeight,
      goalStatus: "completed",
    });

    currentUser.goalStatus = "completed";

    await currentUser.save();
    res.status(200).json({
      message: "Goal completed successfully.",
      historyEntry,
      data: {
        goalStatus: currentUser.goalStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const GetUserGoal = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const [user, goalHistory] = await Promise.all([
      User.findById(currentUser._id).select(
        "primaryGoal calorieTarget goalWeight goalStatus workoutsPerWeek weight",
      ),
      UserGoalLog.find({ user: currentUser._id, goalStatus: "completed" })
        .sort({ createdAt: -1 })
        .select("primaryGoal calorieTarget goalWeight weekStartDate createdAt")
        .limit(20),
    ]);

    res.status(200).json({
      success: true,
      data: {
        primaryGoal: user.primaryGoal,
        calorieTarget: user.calorieTarget || 2000,
        goalWeight: user.goalWeight,
        goalStatus: user.goalStatus,
        workoutsPerWeek: user.workoutsPerWeek || 5,
        currentWeight: parseFloat(user.weight) || 0,
        goalHistory,
      },
      message: "Goal fetched successfully",
    });

    console.log("GetUserGoal response:", {
      primaryGoal: user.primaryGoal,
      calorieTarget: user.calorieTarget,
      goalWeight: user.goalWeight,
      goalStatus: user.goalStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const UserChatWithAI = async (req, res, next) => {
  try {
    // req.body.userProfile = req.user.profile;
    const prompt = buildPrompt(req.body);

    const reply = await getAIResponse(prompt);

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.log(error);
    error.statusCode = 500;
    error.message = "AI processing error";
    next(error);
  }
};

// export const GetChatHistory = async (req, res, next) => {
//   try {
//     const currentUser = req.user;
//     const history = await chatHistory
//       .find({ user: currentUser._id })
//       .select("question response createdAt");
//     res.status(200).json({
//       success: true,
//       data: history,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const RegeneratePlan = async (req, res, next) => {
  try {
    const currentUser = req.user;
    // Logic to regenerate plan based on user's current data and goals
    // This is a placeholder and should be replaced with actual implementation
    const newPlan = {
      meals: [
        { name: "Breakfast", items: ["Oatmeal", "Banana", "Almonds"] },
        { name: "Lunch", items: ["Grilled Chicken Salad", "Quinoa"] },
        { name: "Dinner", items: ["Baked Salmon", "Steamed Vegetables"] },
      ],
      workouts: [
        { name: "Cardio", exercises: ["Running", "Cycling"] },
        { name: "Strength", exercises: ["Push-ups", "Squats"] },
      ],
    };
    res.status(200).json({
      success: true,
      data: newPlan,
    });
  } catch (error) {
    next(error);
  }
};

export const generatePlan = async (req, res, next) => {
  try {
    const requestedPlanType = String(req.body?.planType || "all").toLowerCase();
    const planType = ["diet", "workout", "all"].includes(requestedPlanType)
      ? requestedPlanType
      : "all";

    const user = await User.findById(req.user._id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // Weekly evaluation for intelligent adjustments (optional)
    let adjustedUser = user;
    let adjustmentResult = { adjustments: null, triggers: [] };
    
    try {
      const weeklyRun = await runWeeklyPlanAdjustmentForUser(req.user._id);
      if (weeklyRun?.adjustmentResult) {
        adjustmentResult = weeklyRun.adjustmentResult;
      }
      if (weeklyRun?.updated && weeklyRun.user) {
        adjustedUser = weeklyRun.user;
      }
    } catch (err) {
      console.log("Weekly evaluation skipped:", err.message);
      // Continue with plan generation even if evaluation fails
    }

    const recentProgress = await Progress.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(14)
      .select("workoutAdherencePercent dietAdherencePercent habitScore");

    const progressSummary = recentProgress.length
      ? recentProgress.reduce(
          (acc, item) => {
            acc.avgWorkoutAdherence += Number(item.workoutAdherencePercent || 0);
            acc.avgDietAdherence += Number(item.dietAdherencePercent || 0);
            acc.avgHabitScore += Number(item.habitScore || 0);
            return acc;
          },
          { avgWorkoutAdherence: 0, avgDietAdherence: 0, avgHabitScore: 0 },
        )
      : null;

    const normalizedProgressSummary = progressSummary
      ? {
          avgWorkoutAdherence: Number(
            (progressSummary.avgWorkoutAdherence / recentProgress.length).toFixed(2),
          ),
          avgDietAdherence: Number(
            (progressSummary.avgDietAdherence / recentProgress.length).toFixed(2),
          ),
          avgHabitScore: Number(
            (progressSummary.avgHabitScore / recentProgress.length).toFixed(2),
          ),
        }
      : null;

    const newPlan = await generatePersonalizedAIPlan(adjustedUser, normalizedProgressSummary);
    console.log("Generate Plan", newPlan);

    const currentPlan = adjustedUser.aiPlan || {};
    let updatedPlan = newPlan;

    if (planType === "diet") {
      updatedPlan = {
        ...currentPlan,
        calories: newPlan.calories,
        macros: newPlan.macros,
        meals: newPlan.meals,
      };
    } else if (planType === "workout") {
      updatedPlan = {
        ...currentPlan,
        workoutLevel: newPlan.workoutLevel,
        workoutDays: newPlan.workoutDays,
      };
    }

    adjustedUser.aiPlan = updatedPlan;
    
    // Preserve an explicit before/after summary for UI visibility when changes happen.
    if (adjustmentResult?.adjustments) {
      adjustedUser.lastPlanAdjustment = {
        ...(adjustedUser.lastPlanAdjustment || {}),
        triggers: adjustmentResult.triggers || [],
        adjustments: adjustmentResult.adjustments,
        previousCalories: adjustmentResult.adjustments.fromCalories,
        newCalories: adjustmentResult.adjustments.toCalories,
      };
    }
    
    await adjustedUser.save();

    const successMessage =
      planType === "diet"
        ? "AI diet plan generated successfully"
        : planType === "workout"
          ? "AI workout plan generated successfully"
          : "AI Plan regenerated successfully";

    res.status(200).json({
      message: successMessage,
      aiPlan: updatedPlan,
      planType,
      adjustments: adjustmentResult.adjustments || null,
      triggers: adjustmentResult.triggers || [],
    });
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req, res, next) => {
  try {
    console.log("Logged user:", req.user);

    const { type, description } = req.body;

    if (!type || !description) {
      const error = new Error("All fields required");
      error.statusCode = 400;
      return next(error);
    }

    if (!req.user) {
      const error = new Error("User not authenticated");
      error.statusCode = 401;
      return next(error);
    }

    const ticket = await Ticket.create({
      user: req.user._id,
      type,
      description,
      status: "Open",
    });

    res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.log("Error creating ticket:", error);
    next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");

    const tickets = await Ticket.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

export const createWeeklyProgress = async (req, res, next) => {
  try {
    const workoutAdherencePercent = Number(req.body.workoutAdherencePercent);
    const dietAdherencePercent = Number(req.body.dietAdherencePercent);
    const habitScore = Number(req.body.habitScore);

    if (
      Number.isNaN(workoutAdherencePercent) ||
      Number.isNaN(dietAdherencePercent) ||
      Number.isNaN(habitScore)
    ) {
      const error = new Error("All progress fields are required");
      error.statusCode = 400;
      return next(error);
    }

    // Use today's date for daily progress tracking
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedLog = await Progress.findOneAndUpdate(
      {
        user: req.user._id,
        date: today,
      },
      {
        $set: {
          workoutAdherencePercent,
          dietAdherencePercent,
          habitScore,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    const graphData = await Progress.find({ user: req.user._id })
      .sort({ date: 1 })
      .select("date workoutAdherencePercent dietAdherencePercent habitScore");

    res.status(201).json({
      success: true,
      message: "Daily progress saved successfully",
      log: updatedLog,
      graphData: graphData.map((log) => ({
        week: new Date(log.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        workout: log.workoutAdherencePercent,
        diet: log.dietAdherencePercent,
        habit: log.habitScore,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getProgressGraph = async (req, res, next) => {
  try {
    const logs = await Progress.find({
      user: req.user._id,
    })
      .sort({ date: 1 })
      .select("date workoutAdherencePercent dietAdherencePercent habitScore");

    const graphData = logs.map((log) => ({
      week: new Date(log.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      workout: log.workoutAdherencePercent,
      diet: log.dietAdherencePercent,
      habit: log.habitScore,
    }));

    res.status(200).json({
      success: true,
      graphData,
    });
  } catch (error) {
    next(error);
  }
};
// Weekly Plan Adjustment Evaluation
export const evaluateAndAdjustPlan = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // Manual API call that executes the same weekly rule engine used by automation.
    const weeklyRun = await runWeeklyPlanAdjustmentForUser(req.user._id);

    if (!weeklyRun || weeklyRun.reason === "insufficient_data") {
      return res.status(200).json({
        message: "Insufficient progress data for evaluation (need at least 3 days)",
        weeklyMetrics: weeklyRun?.weeklyMetrics || null,
        adjustments: null,
        triggers: [],
      });
    }

    if (weeklyRun.reason === "already_adjusted_this_week") {
      return res.status(200).json({
        message: "Weekly plan already adjusted in this week",
        weeklyMetrics: null,
        adjustments: null,
        triggers: [],
      });
    }

    const weeklyMetrics = weeklyRun.weeklyMetrics || null;
    const adjustmentResult = weeklyRun.adjustmentResult || { adjustments: null, triggers: [] };

    let response = {
      message: "Plan evaluation completed",
      weeklyMetrics,
      adjustments: null,
      triggers: [],
    };

    // Apply adjustments if any triggers detected
    if (weeklyRun.updated && adjustmentResult.triggers && adjustmentResult.triggers.length > 0) {

      const refreshedUser = await User.findById(req.user._id);
      if (!refreshedUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        return next(error);
      }

      // Regenerate plan with adjusted parameters
      const recentProgress = await Progress.find({ user: req.user._id })
        .sort({ date: -1 })
        .limit(14)
        .select("workoutAdherencePercent dietAdherencePercent habitScore");

      const progressSummary = recentProgress.length
        ? recentProgress.reduce(
            (acc, item) => {
              acc.avgWorkoutAdherence += Number(item.workoutAdherencePercent || 0);
              acc.avgDietAdherence += Number(item.dietAdherencePercent || 0);
              acc.avgHabitScore += Number(item.habitScore || 0);
              return acc;
            },
            { avgWorkoutAdherence: 0, avgDietAdherence: 0, avgHabitScore: 0 },
          )
        : null;

      const normalizedProgressSummary = progressSummary
        ? {
            avgWorkoutAdherence: Number(
              (progressSummary.avgWorkoutAdherence / recentProgress.length).toFixed(2),
            ),
            avgDietAdherence: Number(
              (progressSummary.avgDietAdherence / recentProgress.length).toFixed(2),
            ),
            avgHabitScore: Number(
              (progressSummary.avgHabitScore / recentProgress.length).toFixed(2),
            ),
          }
        : null;

      const newPlan = await generatePersonalizedAIPlan(refreshedUser, normalizedProgressSummary);

      refreshedUser.aiPlan = newPlan;
      refreshedUser.lastPlanAdjustment = {
        ...(refreshedUser.lastPlanAdjustment || {}),
        triggers: adjustmentResult.triggers,
        adjustments: adjustmentResult.adjustments,
        weeklyMetrics,
      };

      await refreshedUser.save();

      response.message = "Plan adjusted based on weekly progress";
      response.adjustments = adjustmentResult.adjustments;
      response.triggers = adjustmentResult.triggers;
      response.newPlan = newPlan;
    } else {
      response.message = "Plan evaluation completed. No change required this week";
      response.adjustments = adjustmentResult.adjustments;
      response.triggers = adjustmentResult.triggers || [];
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getPremiumCoachingLayer = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const data = await getPremiumCoachingLayerData(user, req.body || {});
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdvancedMacroCustomization = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // Premium Coaching Layer - Advanced macro customization endpoint.
    const data = buildAdvancedMacroCustomization({
      user,
      preferences: req.body?.macroPreferences || {},
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMealSwapRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // Premium Coaching Layer - Meal swap engine endpoint.
    const data = buildMealSwapEngine({
      user,
      mealName: req.body?.mealName || "breakfast",
      excludeItems: req.body?.excludeItems || [],
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPersonalizedMealAdjustments = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const lookbackDays = Math.min(Math.max(Number(req.body?.days || 14), 7), 30);
    const fromDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

    const recentDailyProgress = await DailyProgress.find({
      user: req.user._id,
      date: { $gte: fromDate },
    })
      .sort({ date: -1 })
      .select("date caloriesIn dietAdherencePercent energyLevel");

    const macroPlan = buildAdvancedMacroCustomization({
      user,
      preferences: req.body?.macroPreferences || {},
    });

    // Premium Coaching Layer - Personalized meal adjustment endpoint.
    const data = buildPersonalizedMealAdjustments({
      user,
      recentDailyProgress,
      macroPlan,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDeeperRecoveryInsightsData = async (req, res, next) => {
  try {
    const lookbackDays = Math.min(Math.max(Number(req.body?.days || 14), 7), 30);
    const fromDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

    const [recentWorkoutLogs, recentDailyProgress] = await Promise.all([
      WorkoutLog.find({ user: req.user._id, scheduledDate: { $gte: fromDate } })
        .sort({ scheduledDate: -1 })
        .select("scheduledDate status effortRpe durationMin"),
      DailyProgress.find({ user: req.user._id, date: { $gte: fromDate } })
        .sort({ date: -1 })
        .select("date energyLevel dietAdherencePercent"),
    ]);

    // Premium Coaching Layer - Deeper recovery insights endpoint.
    const data = buildDeeperRecoveryInsights({
      recentWorkoutLogs,
      recentDailyProgress,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const premiumExtendedChat = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      const error = new Error("message is required");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findById(req.user._id).select(
      "primaryGoal goal targetCalories workoutsPerWeek experienceLevel foodPreference",
    );

    // Premium Coaching Layer - Extended AI chat response with richer profile + context signal.
    const reply = await getExtendedAIResponse({
      prompt: message,
      context: {
        ...(context || {}),
        userProfile: user,
      },
    });

    res.status(200).json({ success: true, reply });
  } catch (error) {
    next(error);
  }
};