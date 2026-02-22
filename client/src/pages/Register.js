import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import logo from "../assets/logo-rb.png";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resending, setResending] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

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

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
    );
    if (result.success || result.needsVerification) {
      setVerificationSent(true);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await axios.post("http://localhost:5000/api/auth/resend-verification", {
        email: formData.email,
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend");
    }
    setResending(false);
  };

  // ── Verification Sent Screen ──
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3498db]/10 dark:bg-[#3498db]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f39c12]/20 dark:bg-[#f39c12]/10 rounded-full blur-[120px]"></div>

        <div className="relative max-w-md w-full">
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl dark:shadow-black/60 border border-gray-100 dark:border-gray-700/50 p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-4xl">📧</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#1e293b] dark:text-white mb-3">
              Check Your <span className="text-[#3498db]">Email</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2 font-medium leading-relaxed">
              We've sent a verification link to
            </p>
            <p className="text-[#e67e22] font-bold text-lg mb-6">
              {formData.email}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">
              Click the link in the email to activate your account. The link
              expires in 24 hours.
            </p>

            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="w-full py-3.5 rounded-xl font-bold text-[#3498db] border-2 border-[#3498db]/30 hover:bg-[#3498db]/5 transition-all text-sm mb-4 disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend Verification Email"}
            </button>
            <Link
              to="/login"
              className="block w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#1e4b6e] to-[#3498db] hover:shadow-lg transition-all text-sm text-center"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center px-4 bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3498db]/10 dark:bg-[#3498db]/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f39c12]/20 dark:bg-[#f39c12]/10 rounded-full blur-[120px]"></div>

      <div className="relative max-w-lg w-full mt-6">
        {/* --- LOGO BOX --- */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white dark:bg-[#1e293b] p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <img src={logo} alt="Logo" className="h-14 w-auto object-contain" />
          </div>
        </div>

        {/* Card - Compact Padding */}
        <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl dark:shadow-black/60 border border-gray-100 dark:border-gray-700/50 p-7 pt-12">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-[#1e293b] dark:text-white mb-1">
              Join <span className="text-[#3498db]">Marg</span>
              <span className="text-[#e67e22]">Disha</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Have an account?{" "}
              <Link
                to="/login"
                className="text-[#e67e22] hover:underline font-bold"
              >
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-2 rounded-xl border bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800/50 text-xs font-medium animate-shake text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 ml-1">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#3498db] outline-none transition-all text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 ml-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#3498db] outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 ml-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 ml-1">
                  Confirm
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] outline-none transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#1e4b6e] to-[#3498db] hover:shadow-lg hover:shadow-[#3498db]/30 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 text-sm"
            >
              {loading ? "Creating Account..." : "Start Your Journey"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
