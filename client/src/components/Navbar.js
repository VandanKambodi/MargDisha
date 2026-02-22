import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import logo from "../assets/logo-rb.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: "Take Quiz", path: "/quiz" },
    { name: "Colleges", path: "/colleges" },
    { name: "Courses", path: "/courses" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-[#0f172a]/80 border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* --- LOGO AREA --- */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative flex items-center justify-center">
              <img
                src={logo}
                alt="MargDisha Logo"
                className="h-12 w-auto group-hover:rotate-6 transition-transform duration-500"
              />
            </div>
            <div className="hidden sm:flex flex-col -space-y-1">
              <span className="text-xl font-black tracking-tighter text-[#1e293b] dark:text-white">
                Marg<span className="text-[#e67e22]">Disha</span>
              </span>
              <span className="text-[10px] font-bold text-[#3498db] uppercase tracking-[0.2em]">
                Career Intelligence
              </span>
            </div>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-bold tracking-tight transition-all duration-200 
                  ${
                    isActive(link.path)
                      ? "text-[#e67e22] bg-orange-50 dark:bg-orange-900/10"
                      : "text-gray-600 dark:text-gray-400 hover:text-[#3498db] hover:bg-blue-50 dark:hover:bg-blue-900/10"
                  }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-800 mx-4" />

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                    ${isActive("/dashboard") ? "text-[#3498db]" : "text-gray-600 dark:text-gray-400 hover:text-[#3498db]"}`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e4b6e] to-[#3498db] flex items-center justify-center text-white font-bold text-xs border-2 border-white dark:border-gray-800 shadow-md hover:scale-105 transition-transform"
                >
                  {user?.name?.charAt(0) || "U"}
                </Link>

                <ThemeToggle />

                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <ThemeToggle />

                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-[#3498db] transition-colors"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-6 py-2.5 rounded-xl bg-[#e67e22] text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-inner"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 8h16M4 16h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE DROPDOWN --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0f172a] border-b border-gray-100 dark:border-gray-800 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-lg font-bold text-gray-700 dark:text-gray-200"
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-gray-100 dark:border-gray-800" />
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block font-bold text-[#3498db]"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block font-bold text-gray-700 dark:text-gray-200"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block font-bold text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-center rounded-xl bg-gray-50 dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-center rounded-xl bg-[#e67e22] text-white font-bold shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
