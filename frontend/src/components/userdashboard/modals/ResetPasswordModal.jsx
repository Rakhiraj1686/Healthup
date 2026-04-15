import React, { useState } from "react";
import api from "../../../config/Api";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { RxCross2 } from "react-icons/rx";

const ResetPasswordModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    cfNewPassword: "",
  });

  const handleClear = () =>
    setFormData({
      oldPassword: "",
      newPassword: "",
      cfNewPassword: "",
    });

  const [show, setShow] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let temp = {};

    if (!formData.oldPassword) temp.oldPassword = "Old password is required";

    if (!formData.newPassword) temp.newPassword = "New password is required";

    if (formData.newPassword !== formData.cfNewPassword)
      temp.cfNewPassword = "Passwords do not match";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    console.log(formData);

    setLoading(true);
    try {
      const res = await api.patch("user/resetPassword", formData);
      toast.success(res.data.message);
      onClose();
      handleClear();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      handleClear();
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-8 text-gray-400 hover:text-red-400 text-xl cursor-pointer"
        >
          <RxCross2 />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-6 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent text-center">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Old Password */}
          <div>
            <label className="text-sm text-gray-300">Old Password</label>
            <div className="relative mt-1">
              <input
                type={show.old ? "text" : "password"}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className={`w-full bg-white/10 border ${
                  errors.oldPassword ? "border-red-500" : "border-white/20"
                } rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="Enter old password"
              />
              <button
                type="button"
                onClick={() => setShow({ ...show, old: !show.old })}
                className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
              >
                {show.old ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.oldPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.oldPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="text-sm text-gray-300">New Password</label>
            <div className="relative mt-1">
              <input
                type={show.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full bg-white/10 border ${
                  errors.newPassword ? "border-red-500" : "border-white/20"
                } rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShow({ ...show, new: !show.new })}
                className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
              >
                {show.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm text-gray-300">Confirm Password</label>
            <div className="relative mt-1">
              <input
                type={show.confirm ? "text" : "password"}
                name="cfNewPassword"
                value={formData.cfNewPassword}
                onChange={handleChange}
                className={`w-full bg-white/10 border ${
                  errors.cfNewPassword ? "border-red-500" : "border-white/20"
                } rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShow({ ...show, confirm: !show.confirm })}
                className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
              >
                {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.cfNewPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.cfNewPassword}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-gray-600 py-2 rounded-xl hover:bg-gray-700 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-linear-to-r from-purple-500 to-blue-500 py-2 rounded-xl hover:scale-105 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
