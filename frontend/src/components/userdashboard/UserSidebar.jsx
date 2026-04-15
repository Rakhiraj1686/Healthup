import React from "react";
import {
  FiHome,
  FiUser,
  FiBarChart2,
  FiTrendingUp,
  FiMap,
  FiLogOut,
} from "react-icons/fi";
import { MdOutlineContactSupport } from "react-icons/md";
import { GoGoal } from "react-icons/go";
import { GiProgression } from "react-icons/gi";
import { HiOutlineX } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../config/Api";

const menuItems = [
  { id: "overview", label: "Overview", icon: <FiHome /> },
  { id: "plan", label: "Plan", icon: <FiBarChart2 /> },
  { id: "progression", label: "Progression", icon: <FiMap /> },
  { id: "analytics", label: "Analytics", icon: <FiTrendingUp /> },
  { id: "progress", label: "Progress", icon: <GiProgression /> },
  { id: "profile", label: "Profile", icon: <FiUser /> },
  { id: "goal", label: "Goal", icon: <GoGoal /> },
  { id: "support", label: "Support", icon: <MdOutlineContactSupport /> },
];

const UserSidebar = ({
  active,
  setActive,
  isCollapsed,
  setIsCollapsed,
  setMobileOpen,
}) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await api.get("/auth/logout");
      toast.success(res.data.message);

      sessionStorage.removeItem("HealthUP");
      setUser("");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div
      className={`
    h-full flex flex-col
    ${isCollapsed ? "w-20" : "w-72"}
    bg-linear-to-b from-[#030712] via-[#0f172a] to-[#020617]
    backdrop-blur-3xl
    border-r border-cyan-400/20
    transition-all duration-300
  `}
    >
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        {!isCollapsed && (
          <h1 className="text-xl font-bold bg-linear-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
            HealthUP
          </h1>
        )}

        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden inline-flex items-center justify-center size-8 rounded-lg border border-white/10 hover:bg-white/10 transition cursor-pointer text-white"
          aria-label="Close sidebar"
        >
          <HiOutlineX className="text-lg" />
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center size-8 rounded-lg border border-white/10 hover:bg-white/10 transition cursor-pointer text-white"
        >
          ☰
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
        {menuItems.map((item) => {
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActive(item.id);
                setMobileOpen(false);
              }}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={`
                w-full flex items-center ${isCollapsed ? "justify-center" : "justify-start"} gap-4 px-4 py-3 rounded-xl
                transition-all duration-300 group cursor-pointer border
                ${
                  isActive
                    ? "bg-linear-to-r from-purple-500/20 to-cyan-500/20 border-cyan-400/30 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                    : "border-transparent hover:bg-white/5"
                }
              `}
            >
              <span
                className={`text-lg ${
                  isActive
                    ? "text-cyan-400"
                    : "text-gray-400 group-hover:text-white"
                }`}
              >
                {item.icon}
              </span>

              {!isCollapsed && (
                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isCollapsed ? "justify-center" : "justify-start"} gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 transition cursor-pointer`}
        >
          <FiLogOut className="text-red-400" />
          {!isCollapsed && (
            <span className="text-sm text-red-400 font-medium">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;
