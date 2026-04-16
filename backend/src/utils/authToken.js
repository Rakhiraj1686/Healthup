import jwt from "jsonwebtoken";

// export const genToken = (user, res) => {
//   try {
//     const payload = {
//       id: user._id,
//       role: user.role,
//     };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     console.log(token);

//     res.cookie("HealthUP", token, {
//       maxAge: 1000 * 60 * 60 * 24, // 1 day
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production" ? true : false,
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//     });
//   } catch (error) {
//     throw error;
//   }
// };



export const genToken = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("HealthUP", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
};



export const genOtpToken = (user, res) => {
  try {
    const payload = {
      id: user._id,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "10m",
    }); //1h,60,1d

    console.log(token);

    res.cookie("otpToken", token, {
      maxAge: 1000 * 60 * 10,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
  } catch (error) {
    throw error;
  }
};
