import jwt from "jsonwebtoken";
import User from "../model/userProfileModel.js";

export const Protect = async (req, res, next) => {
  try {
    const token = req.cookies.HealthUP;
    console.log("cookies received" , token)
    console.log("Token received in cookies:", token);

    if (!token) {
      const error = new Error("Unauthorized! No token found");
      error.statusCode = 401;
      return next(error);
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decode);
    if (!decode) {
      const error = new Error("Unauthorized! Please Login Again");
      error.statusCode = 401;
      return next(error);
    }

    const verifiedUser = await User.findById(decode.id);
    if (!verifiedUser) {
      const error = new Error("Unauthorized! Please Login Again");
      error.statusCode = 401;
      return next(error);
    }
    req.user = verifiedUser;

    next();
  } catch (error) {
    next(error);
  }
};

export const OtpProtect = async (req, res, next) => {
  try {
    const token = req.cookies.otpToken;
    console.log("Token recived in cookies:", token);

    if (!token) {
      const error = new Error("Unauthorized! No token found");
      error.statusCode = 401;
      return next(error);
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decode);
    // if (!decode) {
    //   const error = new Error("Unauthorized! Please try again");
    //   error.statusCode = 401;
    //   return next(error);
    // }

    const verifiedUser = await User.findById(decode.id);
    if (!verifiedUser) {
      const error = new Error("Unauthorized! Please try Again");
      error.statusCode = 401;
      return next(error);
    }
    req.user = verifiedUser;
    next();
  } catch (error) {
    next(error);
  }
};
