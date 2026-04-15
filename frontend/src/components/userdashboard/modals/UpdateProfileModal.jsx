import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../config/Api";
import { RxCross2 } from "react-icons/rx";
import { createPortal } from "react-dom";

const UserEditProfileModal = ({ onClose }) => {
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    mobileNumber: user?.mobileNumber || "",
    age: user?.age || "",
    height: user?.height || "",
    weight: user?.weight || "",
    biologicalSex: user?.biologicalSex || "",
    foodPreference: user?.foodPreference || "",
    workoutPreference: user?.workoutPreference || "",
    experienceLevel: user?.experienceLevel || "",
    activityLevel: user?.activityLevel || "",
    goal: user?.goal || user?.primaryGoal || "maintain",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  /* INPUT CHANGE */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // VALIDATION
  const validateForm = () => {
    let newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full name required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage({ type: "error", text: "Fix errors first" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    console.log(formData);

    try {
      const res = await api.patch("/user/updateProfile", formData);

      if (res.data?.data) {
        sessionStorage.setItem("HealthUP", JSON.stringify(res.data.data));
        setUser(res.data.data);
        setMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  /* PORTAL RENDER */
  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-9999 overflow-y-auto p-4">
      <div
        className="bg-linear-to-br from-[#020617] to-[#0f172a] 
      w-full max-w-3xl max-h-[90vh] overflow-y-auto 
      rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl"
      >
        {/* HEADER */}
        <div
          className="flex justify-between px-6 py-4 
        border-b border-white/10 sticky top-0 
        bg-white/5 backdrop-blur-xl"
        >
          <h2
            className="text-xl font-semibold 
          bg-linear-to-r from-purple-400 to-blue-400 
          bg-clip-text text-transparent"
          >
            Edit Profile
          </h2>

          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-600 text-2xl transition cursor-pointer"
          >
            <RxCross2 />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information Section */}

          <div>
            <h3
              className="text-lg font-semibold 
                bg-linear-to-r from-purple-400 to-blue-400 
                bg-clip-text text-transparent mb-4 pb-2 border-b border-white/30"
            >
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-gray-400
                focus:ring-2
                outline-none transition"${
                  errors.fullName
                    ? "focus:ring-red-500 bg-red-500"
                    : "focus:ring-purple-500"
                }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* PHONE  (DISABLED) */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Phone (Cannot Change)
                </label>
                <input
                  type="text"
                  value={formData.mobileNumber}
                  disabled
                  className="w-full px-4 py-3 rounded-xl
              bg-white/5 border border-white/10
              text-gray-400 cursor-not-allowed"
                />
                <p className="text-red-500 text-xs mt-1">
                  Mobile Number cannot be changed
                </p>
              </div>

              {/* EMAIL (DISABLED) */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Email (Cannot Change)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl
              bg-white/5 border border-white/10
              text-gray-400 cursor-not-allowed"
                />
                <p className="text-red-500 text-xs mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Age</label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-gray-400
                focus:ring-2 focus:ring-purple-500
                outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Other Personal Delails */}

          <div>
            <h3
              className="text-lg font-semibold 
                bg-linear-to-r from-purple-400 to-blue-400 
                bg-clip-text text-transparent mb-4 pb-2 border-b border-white/30"
            >
              Other Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Gender
                </label>
                <select
                  name="biologicalSex"
                  value={formData.biologicalSex}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-gray-400
                focus:ring-2 focus:ring-purple-500
                outline-none transition"
                >
                  <option value="" className="text-gray-800">
                    Select Gender
                  </option>
                  <option value="male" className="text-gray-800">
                    Male
                  </option>
                  <option value="female" className="text-gray-800">
                    Female
                  </option>
                  <option value="other" className="text-gray-800">
                    Other
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Current Weight (kg)
                </label>

                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="Current weight"
                  className="w-full px-4 py-3 rounded-xl
                 bg-white/5 border border-white/10
                 text-white placeholder-gray-400
                  focus:ring-2 focus:ring-purple-500
                 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Height (cm)
                </label>

                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="Enter height in cm"
                  className="w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-gray-400
                    focus:ring-2 focus:ring-purple-500
                    outline-none transition"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Food Preference
                </label>
                <select
                  name="foodPreference"
                  value={formData.foodPreference}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-gray-400
                focus:ring-2 focus:ring-purple-500
                outline-none transition"
                >
                  <option value="" className="text-gray-800">
                    Select Food Preference
                  </option>
                  <option value="vegetarian" className="text-gray-800">
                    Vegetarian
                  </option>
                  <option value="vegan" className="text-gray-800">
                    Vegan
                  </option>
                  <option value="nonvegetarian" className="text-gray-800">
                    Non - Vegetarian
                  </option>
                  <option value="all" className="text-gray-800">
                    All
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Experience Level */}

          <div>
            <h3
              className="text-lg font-semibold 
                bg-linear-to-r from-purple-400 to-blue-400 
                bg-clip-text text-transparent mb-4 pb-2 border-b border-white/30"
            >
              Experience Level
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Experience Level
                </label>

                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white focus:ring-2 focus:ring-purple-500
                outline-none transition"
                >
                  <option value="" className="text-gray-800">
                    Select Experience Level
                  </option>

                  <option value="beginner" className="text-gray-800">
                    Beginner
                  </option>

                  <option value="intermediate" className="text-gray-800">
                    Intermediate
                  </option>

                  <option value="advanced" className="text-gray-800">
                    Advanced
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Activity Level
                </label>

                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white focus:ring-2 focus:ring-purple-500
                outline-none transition"
                >
                  <option value="" className="text-gray-800">
                    Select Activity Level
                  </option>

                  <option value="sedentary" className="text-gray-800">
                    Sedentary
                  </option>

                  <option value="lightly active" className="text-gray-800">
                    Lightly Active
                  </option>

                  <option value="moderately active" className="text-gray-800">
                    Moderately Active
                  </option>

                  <option value="very active" className="text-gray-800">
                    Very Active
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Goal</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white focus:ring-2 focus:ring-purple-500
                outline-none transition"
                >
                  <option value="maintain" className="text-gray-800">
                    Maintain
                  </option>
                  <option value="weight loss" className="text-gray-800">
                    Weight Loss
                  </option>
                  <option value="muscle gain" className="text-gray-800">
                    Muscle Gain
                  </option>
                  <option value="body recomposition" className="text-gray-800">
                    Body Recomposition
                  </option>
                  <option value="improve endurance" className="text-gray-800">
                    Improve Endurance
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Preferred Workout Type
                </label>

                <select
                  name="workoutPreference"
                  value={formData.workoutPreference}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white focus:ring-2 focus:ring-purple-500
                outline-none transition"
                >
                  <option value="" className="text-gray-800">
                    Select Workout Type
                  </option>

                  <option value="strength_training" className="text-gray-800">
                    Strength Training
                  </option>

                  <option value="endurance_training" className="text-gray-800">
                    Endurance Training
                  </option>

                  <option value="functional_training" className="text-gray-800">
                    Functional Training
                  </option>

                  <option value="flexibility_mobility_workout" className="text-gray-800">
                    Flexibility / Mobility Workout
                  </option>

                  <option value="hiit" className="text-gray-800">
                    HIIT
                  </option>

                  <option value="cardio" className="text-gray-800">
                    Cardio
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* MESSAGE */}
          {message.text && (
            <div
              className={`mx-6 mt-4 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-400/20"
                  : "bg-red-500/10 text-red-400 border border-red-400/20"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl 
              bg-white/10 hover:bg-white/20 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl
              bg-linear-to-r from-purple-500 to-blue-500
              hover:scale-105 transition shadow-lg cursor-pointer"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default UserEditProfileModal;
