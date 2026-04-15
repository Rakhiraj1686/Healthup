import React, { useState } from "react";
import { BsArrowClockwise } from "react-icons/bs";
import { Eye, EyeOff } from "lucide-react";
import api from "../../config/Api";
import toast from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";

const ForgetPasswordModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    cfNewPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      isOtpVerified &&
      formData.newPassword !== formData.cfNewPassword
    ) {
      toast.error("Passwords must match");
      setLoading(false);
      return;
    }

    try {
      // console.log(formData);
      let res;
      if (isOtpSent) {
        if (isOtpVerified) {
          res = await api.post("/auth/forgetPassword", formData);
          toast.success(res.data.message);
          onClose();
          console.log("OTP already verify now update passsword");
        } else {
          res = await api.post("auth/verifyOtp", formData);
          toast.success(res.data.message);
          setIsOtpSent(true);
          setIsOtpVerified(true);
        }
      } else {
        res = await api.post("/auth/genOtp", formData);
        toast.success(res.data.message);
        setIsOtpSent(true);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Unknown Error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl text-white relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-lg"
        >
          <RxCross2/>
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-6 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent text-center">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="text-sm text-gray-300">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isOtpSent}
              className="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              placeholder="Enter registered email"
            />
          </div>

          {/* OTP */}
          {isOtpSent && (
            <div>
              <label className="text-sm text-gray-300">OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                disabled={isOtpVerified}
                className="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                placeholder="Enter OTP"
              />
            </div>
          )}

          {/* New Password Section */}
          {isOtpVerified && (
            <div className="space-y-5">

              {/* New Password */}
              <div>
                <label className="text-sm text-gray-300">
                  New Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        new: !showPassword.new,
                      })
                    }
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    {showPassword.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm text-gray-300">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="cfNewPassword"
                    value={formData.cfNewPassword}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        confirm: !showPassword.confirm,
                      })
                    }
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    {showPassword.confirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-purple-500 to-blue-500 py-2 rounded-xl hover:scale-105 transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">
                    <BsArrowClockwise />
                  </span>
                  Processing...
                </>
              ) : !isOtpSent ? (
                "Send OTP"
              ) : !isOtpVerified ? (
                "Verify OTP"
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgetPasswordModal;