import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuUser } from "react-icons/lu";
import { FiMail, FiPhone } from "react-icons/fi";
import { VscLock } from "react-icons/vsc";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineSafety,
} from "react-icons/ai";
import toast from "react-hot-toast";
import api from "../config/Api";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validError, setValidError] = useState({});

  const handleClear = () => {
    setFormData({
      fullName: "",
      email: "",
      mobileNumber: "",
      password: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let Error = {};

    if (formData.fullName.length < 3)
      Error.fullName = "Name should contain atleast three letters";
    else if (!/^[A-z ]+$/.test(formData.fullName))
      Error.fullName = "Only alphabets & spaces allowed";

    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber))
      Error.mobileNumber = "Enter valid Indian number";

    if (
      !/^[\w.+-]+@(gmail|outlook|ricr|yahoo|zohomail)\.(com|in|co\.in)$/.test(
        formData.email,
      )
    )
      Error.email = "Use proper email format";

    if (formData.password.length < 6) Error.password = "Minimum 6 characters";

    setValidError(Error);
    return Object.keys(Error).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validate()) {
      toast.error("Fill the form correctly.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/register", formData);
      toast.success(res.data.message);
      navigate("/login");
      handleClear();
    } catch (error) {
      console.log({ error });

      toast.error(error?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen py-28 flex items-center justify-center bg-[#030712] px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(168,85,247,0.25),transparent_40%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.25),transparent_40%)]" />

        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="text-4xl p-5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-purple-400">
              <AiOutlineSafety />
            </div>

            <h2 className="text-3xl font-bold mt-4 bg-linear-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Create Account
            </h2>

            <p className="text-gray-400 text-sm">Sign up to get started</p>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-2xl border border-cyan-400/20 rounded-3xl shadow-[0_0_35px_rgba(59,130,246,0.3)] p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <InputField
                icon={<LuUser />}
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                error={validError.fullName}
              />

              {/* Email */}
              <InputField
                icon={<FiMail />}
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                error={validError.email}
              />

              {/* Phone */}
              <InputField
                icon={<FiPhone />}
                name="mobileNumber"
                type="tel"
                placeholder="Phone Number"
                value={formData.mobileNumber}
                onChange={handleChange}
                error={validError.mobileNumber}
              />

              {/* Password */}
              <div className="text-end">
                <div className="relative">
                  <VscLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-cyan-400/20 text-white focus:ring-2 focus:ring-cyan-400/60 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                  </button>
                </div>

                {validError.password && (
                  <span className="text-xs text-red-400 ">
                    {validError.password}
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-linear-to-r from-purple-500 to-cyan-500 py-3 rounded-full font-semibold hover:scale-105 transition duration-300 shadow-[0_0_25px_rgba(168,85,247,0.6)] cursor-pointer"
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>

              {/* Login Redirect */}
              <div className="text-center border-t border-white/10 pt-5">
                <p className="text-gray-400 text-sm mb-3">
                  Already have an account?
                </p>

                <Link to="/login" className="text-cyan-300 hover:underline">
                  Login Instead
                </Link>
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            By signing up you agree to our terms & privacy policy.
          </p>
        </div>
      </div>
      <footer className="bg-[#030712] text-white border-t border-cyan-400/20">
        {/* Footer */}
        <div className="border-t border-white/10 text-center py-6 text-gray-500 text-md">
          © {new Date().getFullYear()} HealthUP • All Rights reserved.
        </div>
      </footer>
    </>
  );
};

/* Reusable Input Component */
const InputField = ({ icon, error, ...props }) => (
  <div>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>

      <input
        {...props}
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-cyan-400/20 text-white focus:ring-2 focus:ring-cyan-400/60 outline-none"
      />
    </div>

    {error && (
      <span className="text-xs text-red-400 flex flex-cols justify-end">
        {error}
      </span>
    )}
  </div>
);

export default Signup;
