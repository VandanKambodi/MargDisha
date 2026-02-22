import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/verify-email/${token}`,
        );
        setStatus("success");
        setMessage(res.data.message);

        // Auto-login after verification
        if (res.data.token && res.data.user) {
          loginWithToken(res.data.token, res.data.user);
        }

        // Redirect to dashboard after a short delay
        setTimeout(() => navigate("/dashboard"), 3000);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification failed. The link may be invalid or expired.",
        );
      }
    };

    if (token) verifyEmail();
  }, [token, loginWithToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#3498db]/20 dark:bg-[#3498db]/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#e67e22]/20 dark:bg-[#e67e22]/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="relative max-w-md w-full">
        <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl dark:shadow-black/60 border border-gray-100 dark:border-gray-700/50 p-10 text-center">
          {/* ── Verifying ── */}
          {status === "verifying" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-4xl">⏳</span>
              </div>
              <h2 className="text-3xl font-extrabold text-[#1e293b] dark:text-white mb-3">
                Verifying <span className="text-[#3498db]">Email...</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Please wait while we verify your email address.
              </p>
              <div className="mt-6 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3498db] to-[#e67e22] rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </>
          )}

          {/* ── Success ── */}
          {status === "success" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-3xl font-extrabold text-[#1e293b] dark:text-white mb-3">
                Email <span className="text-green-500">Verified!</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
                {message ||
                  "Your account is now active. Redirecting to dashboard..."}
              </p>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full animate-pulse"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </>
          )}

          {/* ── Error ── */}
          {status === "error" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="text-4xl">❌</span>
              </div>
              <h2 className="text-3xl font-extrabold text-[#1e293b] dark:text-white mb-3">
                Verification <span className="text-red-500">Failed</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                {message}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/register"
                  className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-[#d35400] to-[#e67e22] hover:shadow-lg hover:shadow-[#e67e22]/30 transition-all text-center block"
                >
                  Register Again
                </Link>
                <Link
                  to="/login"
                  className="w-full py-3 rounded-2xl font-bold text-[#3498db] border-2 border-[#3498db]/30 hover:bg-[#3498db]/5 transition-all text-center block"
                >
                  Go to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
