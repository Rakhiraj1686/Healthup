import express from "express";

import {
  UserLogin,
  UserRegister,
  UserLogout,
  UserGenOTP,
  UserVerifyOtp,
  UserForgetPassword,
} from "../controller/authController.js";
import { OtpProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", UserLogin);
router.post("/register", UserRegister);
router.get("/logout", UserLogout);

router.post("/genOtp", UserGenOTP);
router.post("/verifyOtp", UserVerifyOtp);
router.post("/forgetPassword", OtpProtect, UserForgetPassword);

export default router;
