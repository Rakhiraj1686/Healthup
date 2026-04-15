import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { FaRegCircleUser } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import api from "../config/Api";

const Header = () => {
  const { user, isLogin, setUser, setIsLogin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const logout = async () => {
    const res = await api.get("/auth/logout");
    toast.success(res.data.message);
    sessionStorage.removeItem("HealthUP");
    setUser("");
    setIsLogin(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/user-dashboard");
  };

  // useEffect(() => {
  //   function handleClickOutside(event) {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setProfileOpen(false);
  //     }
  //   }
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  return (
    <>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full">
        <div
          className="mx-auto flex items-center justify-between 
          px-4 py-2.5 md:px-16 md:py-3 
          bg-[#0f172a]/80 backdrop-blur-xl 
          border border-white/10 shadow-xl"
        >
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          >
            HealthUP
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-gray-300 font-medium">
            <Link className="hover:text-purple-400 transition" to="/">
              Home
            </Link>
            <Link className="hover:text-purple-400 transition" to="/about">
              About
            </Link>
            <Link className="hover:text-purple-400 transition" to="/contact">
              Contact
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:block">
            {!isLogin ? (
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-5 py-1.5 rounded-full border border-purple-400 
                  hover:bg-linear-to-r from-purple-500 to-blue-500 
                  transition text-white cursor-pointer"
                >
                  Login
                </button>

                <button
                  onClick={() => navigate("/signup")}
                  className="px-5 py-1.5 rounded-full 
                  bg-linear-to-r from-purple-500 to-blue-500 
                  transition text-white cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div
                className="relative ml-4 flex items-center gap-5"

                // ref={dropdownRef}
              >
                {/* Username */}
                <button
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    handleProfileClick();
                  }}
                  className="cursor-pointer flex items-center gap-4 
                  px-4 py-2 rounded-xl 
                  bg-white/10 hover:bg-white/20 
                  border border-white/10 backdrop-blur-md transition"
                >
                  <span className="w-6 h-6 rounded-full ">
                    {user.photo.url ? (
                      <img
                        src={user?.photo?.url}
                        className="w-6 h-6 rounded-full object-cover border"
                      />
                    ) : (
                      <FaRegCircleUser className="w-6 h-6 text-white" />
                    )}
                  </span>
                  {/* Username */}
                  <span className="font-medium text-white">
                    {user?.fullName || "User"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <HiOutlineMenu
            className="w-7 h-7 md:hidden cursor-pointer text-white"
            onClick={() => setMenuOpen(true)}
          />
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[60%] max-w-sm bg-[#020617] text-white z-50 transform transition-transform duration-300 md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-3 border-b border-white/10">
          <span className="text-xl font-semibold">HealthUP</span>
          <HiOutlineX
            className="w-6 h-6 text-red-600"
            onClick={() => setMenuOpen(false)}
          />
        </div>

        <nav className="flex flex-col gap-4 px-6 py-4 text-lg">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>

          <div className="border-t border-white pt-4 ">
            {!isLogin ? (
              <div className="grid grid-cols-2 gap-4 text-purple-500">
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <br />
                <Link to="/signup" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className=" grid grid-cols-1 gap-4 text-purple-500">
                <button
                  onClick={() => {
                    navigate("/user-dashboard");
                    setMenuOpen(false);
                  }}
                >
                  Dashboard
                </button>
                <button onClick={logout} className="text-red-400">
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
