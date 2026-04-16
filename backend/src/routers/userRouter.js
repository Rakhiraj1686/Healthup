import express from "express";
import multer from "multer";
import {
  UserResetPassword,
  UserUpdateProfile,
  UserChangePhoto,
  UserSetGoal,
  UserCompleteGoal,
  GetUserGoal,
  UserChatWithAI,
  RegeneratePlan,
  generatePlan,
  createWeeklyProgress,
  getProgressGraph,
  getMyTickets,
  evaluateAndAdjustPlan,
  getPremiumCoachingLayer,
  getAdvancedMacroCustomization,
  getMealSwapRecommendations,
  getPersonalizedMealAdjustments,
  getDeeperRecoveryInsightsData,
  premiumExtendedChat,
} from "../controller/userController.js";
import { Protect } from "../middleware/authMiddleware.js";
import { checkUserChatLimit } from "../middleware/chatUseLimit.js";

const router = express.Router();
const upload = multer();

// User routes
router.patch("/resetPassword", Protect, UserResetPassword);
router.patch("/updateProfile", Protect, UserUpdateProfile);
router.patch("/changePhoto", Protect, upload.single("image"), UserChangePhoto);

//Set and complete goals
router.put("/setGoal", Protect, UserSetGoal);
router.put("/completeGoal", Protect, UserCompleteGoal);
router.get("/goal", Protect, GetUserGoal);

// AI chat route with usage limit check
router.post("/chat", Protect, checkUserChatLimit, UserChatWithAI);
router.post("/premium/chat", Protect, premiumExtendedChat);

// Additional routes for AI plan generation
router.post("/regenerate-plan", Protect, RegeneratePlan);
router.post("/generatePlan", Protect, generatePlan);
router.post("/plan/evaluate", Protect, evaluateAndAdjustPlan);

// Premium Coaching Layer routes
router.post("/premium/coaching-layer", Protect, getPremiumCoachingLayer);
router.post("/premium/macros", Protect, getAdvancedMacroCustomization);
router.post("/premium/meal-swap", Protect, getMealSwapRecommendations);
router.post("/premium/meal-adjustments", Protect, getPersonalizedMealAdjustments);
router.post("/premium/recovery-insights", Protect, getDeeperRecoveryInsightsData);

// Progress routes
router.post("/progress", Protect, createWeeklyProgress);
router.get("/progress-graph", Protect, getProgressGraph);

// Ticket routes
router.get("/mytickets", Protect, getMyTickets);

export default router;
