import bcrypt from "bcrypt";
import User from "../model/userProfileModel.js";
import { genToken, genOtpToken } from "../utils/authToken.js";
import OTP from "../model/otpModel.js";
import { sendOTPEmail } from "../utils/emailService.js";
import Ticket from "../model/ticketModel.js";

export const UserRegister = async (req, res, next) => {
  try {
    //accept data from fronted
    const { fullName, mobileNumber, email, password } = req.body;

    //verify that all data exist
    if (!fullName || !mobileNumber || !email || !password) {
      const error = new Error("All Field Required");
      error.statusCode = 400;
      return next(error);
    }

    console.log({ fullName, mobileNumber, email, password });

    //check for duplicate user before refistration
    const existingUser = await User.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (existingUser) {
      let message = "";

      if (existingUser.email === email) {
        message = "Email already registered";
      } else if (existingUser.mobileNumber === mobileNumber) {
        message = "Mobile number already registered";
      }

      const error = new Error(message);
      error.statusCode = 409;
      return next(error);
    }

    console.log("Sending Data to DB");

    //encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    //use placeholder image for profile photo
    const photoURL = `https://placehold.co/600x400?text=${fullName.charAt(0).toUpperCase()}`;
    const photo = {
      url: photoURL,
    };

    //save data to database
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      mobileNumber,
      password: hashPassword,
      photo,
    });

    console.log(newUser);
    res.status(201).json({ message: "Registration Successfull !" });
  } catch (error) {
    next(error);
  }
};

export const UserLogin = async (req, res, next) => {
  try {
    //fetch data from fronted
    const { identifier, password } = req.body;

    console.log(req.body);

    //verify that all data exist
    if (!identifier || !password) {
      const error = new Error("All Field Required");
      error.statusCode = 400;
      return next(error);
    }

    //check for if user is registered or not
    const existingUser = await User.findOne({
      $or: [{ email: identifier }, { mobileNumber: identifier }],
    });
    if (!existingUser) {
      const error = new Error("User not registered");
      error.statusCode = 401;
      return next(error);
    }

    //verify password
    const isVerified = await bcrypt.compare(password, existingUser.password);
    if (!isVerified) {
      const error = new Error("Password didn't match");
      error.statusCode = 401;
      return next(error);
    }

    //Token Genration will be done here
    genToken(existingUser, res);

    //send message to fronted
    res
      .status(200)
      .json({ message: "Login Successfull !", data: existingUser });
  } catch (error) {
    next(error);
  }
};

export const UserLogout = async (req, res, next) => {
  try {
    // send mesage to frontend
    res.clearCookie("parle");

    res.status(200).json({ message: "Logout Successfull" });
  } catch (error) {
    next(error);
  }
};

export const UserGenOTP = async (req, res, next) => {
  try {
    //fetch data from frontend
    const { email } = req.body;

    //verify that all data exist
    if (!email) {
      const error = new Error("All fields required");
      error.statusCode = 400;
      return next(error);
    }

    //check if user is registred or not
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      const error = new Error("Email not registered");
      error.statusCode = 401;
      return next(error);
    }

    //Check if user is otp is there or not
    const existingUserOTP = await OTP.findOne({ email });
    if (existingUserOTP) {
      await existingUserOTP.deleteOne();
    }

    const otp = Math.floor(Math.random() * 1000000).toString();
    console.log(typeof otp);

    // encrypt the opt
    const salt = await bcrypt.genSalt(10);
    const hashOTP = await bcrypt.hash(otp, salt);

    console.log(hashOTP);

    await OTP.create({
      email,
      otp: hashOTP,
    });

    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP send on registered email" });
  } catch (error) {
    next(error);
  }
};

export const UserVerifyOtp = async (req, res, next) => {
  try {
    //fetch data from frontend
    const { email, otp } = req.body;

    //verify that all data exist
    if (!email || !otp) {
      const error = new Error("All fields required");
      error.statusCode = 400;
      return next(error);
    }

    //check for if user is registred or not
    const existingUserOTP = await OTP.findOne({ email });
    if (!existingUserOTP) {
      const error = new error("OTP match error ,Please Retry");
      error.statusCode = 401;
      return next(error);
    }

    //verify password
    const isVerified = await bcrypt.compare(otp, existingUserOTP.otp);
    if (!isVerified) {
      const error = new Error("OTP match error, Please Retry");
      error.statusCode = 401;
      return next(error);
    }

    await existingUserOTP.deleteOne();

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      const error = new error("Email not registered");
      error.statusCode = 401;
      return next(error);
    }

    //Token Genration will be done here
    genOtpToken(existingUser, res);

    //send message to frontend
    res.status(200).json({
      message: "OTP Verified. Create new password now",
    });
  } catch (error) {
    next(error);
  }
};

export const UserForgetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const currentUser = req.user;

    if (!newPassword) {
      const error = new Error("All field required");
      error.statusCode = 400;
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    currentUser.password = hashPassword;

    await currentUser.save();

    res.status(200).clearCookie("otpToken").json({
      message: "OTP Verified. Create new password now",
    });
  } catch (error) {
    next(error);
  }
};
