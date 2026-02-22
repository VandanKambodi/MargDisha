import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import logo from "../assets/logo-rb.png";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          password: formData.password,
        },
      );

      // Auto-login
      if (res.data.token && res.data.user) {
        loginWithToken(res.data.token, res.data.user);
      }
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. The link may have expired.",
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#e67e22]/20 dark:bg-[#e67e22]/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#3498db]/20 dark:bg-[#3498db]/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="relative max-w-md w-full mt-12">
        {/* Logo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white dark:bg-[#1e293b] p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl dark:shadow-black/60 border border-gray-100 dark:border-gray-700/50 p-10 pt-16 transform transition-all">
          {success ? (
            /* ── Success State ── */
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-3xl font-extrabold text-[#1e293b] dark:text-white mb-3">
                Password <span className="text-green-500">Reset!</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
                Your password has been updated. Redirecting to dashboard...
              </p>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3498db] to-[#e67e22] animate-pulse"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-[#1e293b] dark:text-white mb-3">
                  Set New <span className="text-[#e67e22]">Password</span>
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Choose a strong password for your account.
                </p>
              </div>

              {error && (
                <div className="mb-6 px-4 py-3 rounded-xl border bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 text-sm font-medium">
                  {error}
                  {error.includes("expired") && (
                    <Link
                      to="/forgot-password"
                      className="block mt-2 text-[#3498db] hover:text-[#e67e22] font-bold text-xs underline"
                    >
                      Request a new reset link
                    </Link>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                    New Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                    Confirm New Password
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-[#d35400] to-[#e67e22] hover:shadow-lg hover:shadow-[#e67e22]/30 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <p className="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm">
                <Link
                  to="/login"
                  className="font-bold text-[#3498db] hover:text-[#e67e22] transition-colors"
                >
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
