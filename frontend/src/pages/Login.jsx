import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import { LuUser } from "react-icons/lu";
import { VscLock } from "react-icons/vsc";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineSafety,
} from "react-icons/ai";
import toast from "react-hot-toast";
import api from "../config/Api";
import { useAuth } from "../context/AuthContext";
import ForgetPasswordModal from "../components/publicModals/ForgetPasswordModal";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isForgetPasswordModal, setIsForgetPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();

  const handleClear = () => {
    setFormData({
      identifier: "",
      password: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      console.log("Login Data", formData);
      toast.success(res.data.message);
      setUser(res.data.data);
      sessionStorage.setItem("HealthUP", JSON.stringify(res.data.data));
      navigate("/user-dashboard");
      handleClear();
    } catch (error) {
      console.log({ error });
      toast.error(error?.response?.data?.message || "Unknown Error");
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
            <div className="text-4xl p-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-purple-400">
              <AiOutlineSafety />
            </div>

            <h2 className="text-3xl font-bold mt-4 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Welcome Back
            </h2>

            <p className="text-gray-400 text-sm">Sign in to continue</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/5 backdrop-blur-2xl border border-cyan-400/20 rounded-3xl shadow-[0_0_35px_rgba(59,130,246,0.3)] p-8">
            <form
              onSubmit={handleSubmit}
              onReset={handleClear}
              className="space-y-6"
            >
              {/* Email */}
              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  Email Address/Mobile Number
                </label>

                <div className="relative">
                  <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    placeholder="Enter your email or phone"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-cyan-400/20 text-white focus:ring-2 focus:ring-cyan-400/60 outline-none transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  Password
                </label>

                <div className="relative">
                  <VscLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-cyan-400/20 text-white focus:ring-2 focus:ring-cyan-400/60 outline-none transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
                    ) : (
                      <AiOutlineEye className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-cyan-500 py-3 rounded-full font-semibold hover:scale-105 transition duration-300 shadow-[0_0_25px_rgba(168,85,247,0.6)] cursor-pointer"
              >
                <FiLogIn />
                {isLoading ? "Signing in..." : "Sign In"}
              </button>

              {/* Forgot Password */}
              <div className="text-right border-b border-white/10 pb-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgetPasswordModal(true);
                  }}
                  className="text-sm text-gray-400 hover:text-cyan-300"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Signup */}
              <div className="flex justify-between text-sm text-gray-400">
                <span>Don’t have an account?</span>

                <Link to="/signup" className="text-cyan-300 hover:underline">
                  Sign Up
                </Link>
              </div>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By signing in you agree to our terms & privacy policy.
          </p>
        </div>
        {isForgetPasswordModal && (
          <ForgetPasswordModal
            onClose={() => setIsForgetPasswordModal(false)}
          />
        )}
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

export default Login;
