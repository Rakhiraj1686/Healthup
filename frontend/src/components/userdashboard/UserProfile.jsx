import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
// import UserImage from "../../assets/userImage.jpg";
import { FaCamera, FaPhoneAlt } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import ResetPasswordModal from "./modals/ResetPasswordModal";
import UpdateProfileModal from "./modals/UpdateProfileModal";
import toast from "react-hot-toast";
import api from "../../config/Api";
// import ProgressGraph from "../components/ProgressGraph";

const UserProfile = () => {
  const { user, setUser } = useAuth();

  const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] =
    useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [tickets, setTickets] = useState([]);
  const [preview, setPreview] = useState("");
 const [progressData, setProgressData] = useState([]);

  // Get BMI category and color
  const getBMIStatus = (bmi) => {
    if (!bmi) return { status: "N/A", color: "text-gray-400", bgColor: "bg-gray-400/10" };
    if (bmi < 18.5) return { status: "Underweight", color: "text-blue-300", bgColor: "bg-blue-400/10" };
    if (bmi < 25) return { status: "Normal", color: "text-green-300", bgColor: "bg-green-400/10" };
    if (bmi < 30) return { status: "Overweight", color: "text-yellow-300", bgColor: "bg-yellow-400/10" };
    return { status: "Obese", color: "text-red-300", bgColor: "bg-red-400/10" };
  };

  const changePhoto = async (photo) => {
    const form_Data = new FormData();
    form_Data.append("image", photo);

    console.log(form_Data);

    try {
      const res = await api.patch("/user/changePhoto", form_Data);
      toast.success(res.data.message);
      setUser(res.data.data);
      sessionStorage.setItem("HealthUP", JSON.stringify(res.data.data));
      setPreview("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unknown Error");
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newPhotoURL = URL.createObjectURL(file);
      setPreview(newPhotoURL);
      setTimeout(() => {
        changePhoto(file);
      }, 1000);
    }
  };

  const profileCompletion = user?.profileCompleted ? 100 : 60;

  const getTicketId = useMemo(() => {
    return (ticketId) => {
      if (!ticketId) return "#0000";
      const suffix = ticketId.slice(-6);
      const numeric = Number.parseInt(suffix, 16);
      if (Number.isNaN(numeric)) return `#${ticketId.slice(-4).toUpperCase()}`;
      return `#${String(numeric).slice(-4).padStart(4, "0")}`;
    };
  }, []);

  const handleRegenerate = async () => {
    try {
      const res = await api.post("/user/generateplan");

      toast.success(res.data.message);

      setUser({
        ...user,
        aiPlan: res.data.aiPlan,
      });

      sessionStorage.setItem(
        "HealthUP",
        JSON.stringify({
          ...user,
          aiPlan: res.data.aiPlan,
        }),
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

//   const saveProgress = async () => {
//   try {
//     await api.post("/user/progress", {
//       workoutAdherencePercent: 80,
//       dietAdherencePercent: 75,
//       habitScore: 85,
//     });

//     // Refresh graph after saving
//     const res = await api.get("/user/progress-graph");
//     setProgressData(res.data.graphData);

//   } catch (error) {
//     console.log(error);
//   }
// };


  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get("/user/mytickets");
        console.log("Tickets: ", res.data);
        setTickets(res.data.tickets);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTickets();

    const intervalId = setInterval(() => {
      fetchTickets();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

 

  return (
    <>
      <div className="min-h-screen text-white p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Section */}
          <div className="grid lg:grid-cols-1 gap-8">
            {/* LEFT: Profile Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* LEFT → Profile Image */}
                <div className="flex flex-col items-center">
                  <div className="relative flex flex-col items-center">
                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-purple-500">
                      <img
                        src={preview || user?.photo?.url || UserImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <label
                      htmlFor="imageUpload"
                      className="absolute bottom-2 right-2 bg-linear-to-r from-purple-500 to-blue-500 p-3 rounded-full cursor-pointer hover:scale-110 transition"
                    >
                      <FaCamera size={16} />
                    </label>
                    <input
                      type="file"
                      id="imageUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    Click camera to change photo
                  </p>
                </div>

                {/* CENTER → User Details */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold">{user?.fullName}</h1>

                  <div className="flex gap-4 items-center">
                    <span className="inline-block mt-2 px-4 py-1 rounded-full text-sm bg-linear-to-r from-purple-500 to-blue-500 text-white">
                      {user?.role}
                    </span>

                    <span
                      className={`mt-2 px-4 py-1  rounded-full text-sm font-semibold ${
                        user?.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user?.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-6 space-y-2 text-sm text-gray-300">
                    <p className="flex items-center gap-2">
                      <strong>
                        <MdOutlineEmail />
                      </strong>
                      {user?.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <strong>
                        <FaPhoneAlt className="text-xs" />
                      </strong>
                      {user?.mobileNumber}
                    </p>
                  </div>
                </div>

                {/* RIGHT → Progress + Actions */}
                <div className="w-full md:w-72">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Profile Completion</span>
                    <span>{profileCompletion}%</span>
                  </div>

                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>

                  <div className="flex flex-col gap-3 mt-6">
                    <button
                      onClick={() => setIsUpdateProfileModalOpen(true)}
                      className="bg-linear-to-r from-purple-500 to-blue-500 py-2 rounded-xl hover:scale-105 transition cursor-pointer"
                    >
                      Edit Profile
                    </button>

                    <button
                      onClick={() => setIsResetPasswordModalOpen(true)}
                      className="bg-gray-600 py-2 rounded-xl hover:bg-gray-700 transition cursor-pointer"
                    >
                      Reset Password
                    </button>

                    {/* <button
                      onClick={handleRegenerate}
                      className="mb-6 bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                      Regenerate AI Plan
                    </button> */}
                  </div>
                </div>
              </div>
            </div>

            {user?.aiPlan && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
                <h3 className="text-xl font-bold mb-6 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  AI Nutrition Plan
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400">Calories</p>
                    <p className="text-lg font-semibold text-white">
                      {user?.aiPlan?.calories}
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400">Protein</p>
                    <p className="text-lg font-semibold text-white">
                      {user?.aiPlan?.macros?.protein}g
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400">Carbs</p>
                    <p className="text-lg font-semibold text-white">
                      {user?.aiPlan?.macros?.carbs}g
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400">Fats</p>
                    <p className="text-lg font-semibold text-white">
                      {user?.aiPlan?.macros?.fats}g
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl text-center col-span-2 md:col-span-1">
                    <p className="text-gray-400">Workout Level</p>
                    <p className="text-lg font-semibold text-white capitalize">
                      {user?.aiPlan?.workoutLevel}
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400">BMI</p>
                    <p className="text-lg font-semibold text-white">
                      {user?.bmi ? user.bmi.toFixed(1) : "--"}
                    </p>
                    <p className={`text-sm mt-2 font-medium ${getBMIStatus(user?.bmi).color}`}>
                      {getBMIStatus(user?.bmi).status}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold mb-4 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  AI Fitness Status
                </h2>
                <p className="text-gray-300 text-sm">
                  {user?.profileCompleted
                    ? "Your profile is ready. AI plans and insights are fully enabled."
                    : "Complete your health details to unlock adaptive AI workout and diet plans."}
                </p>
              </div>
              {/* <button
                onClick={handleRegenerate}
                className="mb-6 bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition cursor-pointer"
              >
                Regenerate AI Plan
              </button> */}
            </div>

            {/* <ProgressGraph data={progressData} /> */}

            {/* Support Tickets Section */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl mb-6">
              <h2 className="text-xl font-bold mb-6 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                My Support Tickets
              </h2>

              {tickets.length === 0 ? (
                <p className="text-gray-400 text-sm">No tickets raised yet.</p>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="bg-white/10 p-4 rounded-xl mb-4 flex flex-col gap-3 border border-white/5 hover:border-purple-500/40 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{ticket.type}</p>
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/40">
                            {getTicketId(ticket._id)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {ticket.description}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          ticket.status === "Open"
                            ? "bg-green-500/20 text-green-400 border border-green-500/40"
                            : ticket.status === "In Progress"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                        }`}
                      >
                        🔘 {ticket.status}
                      </span>
                    </div>

                    {ticket.solution && (
                      <div className="bg-white/5 p-3 rounded-lg border-l-2 border-blue-500">
                        <p className="text-xs text-blue-300 font-semibold mb-1">✓ Solution:</p>
                        <p className="text-sm text-gray-300">{ticket.solution}</p>
                      </div>
                    )}

                    {ticket.resolvedAt && (
                      <p className="text-xs text-gray-500">
                        Resolved: {new Date(ticket.resolvedAt).toLocaleDateString("en-IN")}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {isUpdateProfileModalOpen && (
          <UpdateProfileModal
            onClose={() => setIsUpdateProfileModalOpen(false)}
          />
        )}
        {isResetPasswordModalOpen && (
          <ResetPasswordModal
            onClose={() => setIsResetPasswordModalOpen(false)}
          />
        )}
      </div>
    </>
  );
};

// function Stat({ label, value }) {
//   return (
//     <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
//       <p className="text-gray-400 text-xs mb-1">{label}</p>
//       <p className="font-semibold">{value}</p>
//     </div>
//   );
// }

export default UserProfile;
