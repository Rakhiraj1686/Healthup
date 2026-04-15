import React, { useState, useEffect } from "react";
import UserSidebar from "../../components/userdashboard/UserSidebar";
import UserOverview from "../../components/userdashboard/UserOverview";
import UserSupport from "../../components/userdashboard/UserSupport";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserProgress from "../../components/userdashboard/UserProgress";
import UserProfile from "../../components/userdashboard/UserProfile";
import UserGoal from "../../components/userdashboard/UserGoal";
import UserPlan from "../../components/userdashboard/UserPlan";
import { FaBars } from "react-icons/fa";
import ProgressionPlan from "../../components/ProgressionPlan";
import AdvancedAnalytics from "../../components/AdvancedAnalytics";
import DashboardDisclaimer from "../../components/userdashboard/DashboardDisclaimer";

const UserDashboard = () => {
  const { isLogin } = useAuth();
  const navigate = useNavigate();

  const [active, setActive] = useState("overview");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sectionTitles = {
    overview: "Overview",
    plan: "Plan",
    progression: "Progression",
    analytics: "Analytics",
    progress: "Progress",
    profile: "Profile",
    goal: "Goal",
    support: "Support",
  };

  useEffect(() => {
    if (!isLogin) navigate("/login");
  }, [isLogin, navigate]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };

    // Prevent background scroll when the mobile drawer is open.
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileOpen]);

  const handleOpenMobileMenu = () => {
    setIsCollapsed(false);
    setMobileOpen(true);
  };

  return (
    <div className="fixed inset-x-0 top-12 bottom-0 flex overflow-hidden bg-linear-to-br from-[#020617] to-[#0f172a] text-white md:gap-4 md:top-15">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 md:hidden z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-full
          bg-[#020617] border-r border-white/10
          transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0
          w-[82vw] max-w-[320px] md:max-w-none md:w-auto
          ${isCollapsed ? "md:w-20" : "md:w-96"}
        `}
      >
        <UserSidebar
          active={active}
          setActive={setActive}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          setMobileOpen={setMobileOpen}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:pl-1">
        {/* Mobile Topbar */}
        <div className="md:hidden px-4 py-3 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#020617]/95 backdrop-blur z-30">
          <button
            onClick={handleOpenMobileMenu}
            className="inline-flex items-center justify-center size-9 rounded-lg border border-white/15 text-gray-200"
            aria-label="Open sidebar"
          >
            <FaBars />
          </button>
          <p className="text-sm font-semibold text-gray-200">{sectionTitles[active] || "Overview"}</p>
          <span className="size-9" />
        </div>

        <div
          className={`w-full mx-auto p-4 md:p-6 lg:p-8 transition-all duration-300 ${
            isCollapsed ? "max-w-7xl" : "max-w-6xl"
          }`}
        >
           <DashboardDisclaimer section={active} />
          {active === "overview" && <UserOverview />}
          {active === "plan" && <UserPlan />}
          {active === "progression" && <ProgressionPlan />}
          {active === "analytics" && <AdvancedAnalytics />}
          {active === "progress" && <UserProgress />}
          {active === "profile" && <UserProfile />}
          {active === "goal" && <UserGoal />}
          {active === "support" && <UserSupport />}
         
        </div>
      </main>
    </div>

    // <div className="min-h-screen flex bg-gradient-to-br from-[#020617] to-[#0f172a] text-white">

    // // {/* Overlay (Mobile only) */}
    // {mobileOpen && (
    //   <div
    //     className="fixed inset-0 bg-black/50 z-40 md:hidden"
    //     onClick={() => setMobileOpen(false)}
    //   />
    // )}

    // // {/* Sidebar */}
    // <aside
    //   className={`
    //     fixed md:static z-50 h-full bg-[#020617]
    //     border-r border-white/10 transition-all duration-300
    //     ${mobileOpen ? "left-0" : "-left-full"}
    //     md:left-0
    //     ${isCollapsed ? "w-20" : "w-64"}
    //   `}
    // >
    //   <UserSidebar
    //     active={active}
    //     setActive={setActive}
    //     isCollapsed={isCollapsed}
    //     setIsCollapsed={setIsCollapsed}
    //     setMobileOpen={setMobileOpen}
    //   />
    // </aside>

    // {/* Main Content */}
    // <main className="flex-1 flex flex-col overflow-hidden">

    //   {/* Mobile Header */}
    //   <div className="md:hidden flex items-center p-4 border-b border-white/10">
    //     <button onClick={() => setMobileOpen(true)}>
    //       <FaBars />
    //     </button>
    //   </div>

    //   {/* Page Content */}
    //   <div className="flex-1 overflow-y-auto p-4 md:p-6">
    //     {active === "overview" && <UserOverview />}
    //     {active === "plan" && <UserPlan />}
    //     {active === "progress" && <UserProgress />}
    //     {active === "profile" && <UserProfile />}
    //     {active === "goal" && <UserGoal />}
    //     {active === "support" && <UserSupport />}
    //   </div>
    // </main>
    // </div>
  );
};

export default UserDashboard;
