import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";

const SAVED_API = "http://localhost:5000/api/saved";

const Dashboard = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [savedCounts, setSavedCounts] = useState({ colleges: 0, courses: 0 });

  useEffect(() => {
    fetchUserData();
    fetchSavedCounts();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/profile",
      );
      const userData = response.data;
      if (userData.quizResults && userData.quizResults.length > 0) {
        const latestQuiz =
          userData.quizResults[userData.quizResults.length - 1];
        setRecommendations(latestQuiz.recommendations || []);
        setRecentQuizzes(userData.quizResults.slice(-3));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchSavedCounts = async () => {
    try {
      const [colRes, courseRes] = await Promise.all([
        axios.get(`${SAVED_API}/colleges`),
        axios.get(`${SAVED_API}/courses`),
      ]);
      setSavedCounts({
        colleges: colRes.data.success ? colRes.data.colleges.length : 0,
        courses: courseRes.data.success ? courseRes.data.courses.length : 0,
      });
    } catch (err) {
      console.error("Error fetching saved counts:", err);
    }
  };

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-all duration-500 overflow-hidden relative">
      {/* Background Glows (Image 2 Colors) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3498db]/5 dark:bg-[#3498db]/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#e67e22]/5 dark:bg-[#e67e22]/10 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardAnimation}
          className="mb-12"
        >
          <h1 className="text-4xl font-extrabold text-[#1e293b] dark:text-white">
            Welcome back,{" "}
            <span className="text-[#e67e22]">{user?.name || "Explorer"}</span>{" "}
            👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">
            Your personalized career roadmap is ready.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={cardAnimation}
              className="bg-white/70 dark:bg-[#1e293b]/70 backdrop-blur-xl border border-white dark:border-gray-800 rounded-[2rem] p-8 shadow-xl"
            >
              <h2 className="text-xl font-bold text-[#1e293b] dark:text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#e67e22] rounded-full"></span>{" "}
                Quick Actions
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Link to="/quiz">
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="group p-6 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#0f172a] hover:border-[#e67e22] transition-all shadow-sm hover:shadow-orange-200 dark:hover:shadow-none"
                  >
                    <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="font-bold text-lg text-[#1e293b] dark:text-white">
                      Career Quiz
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Update your personality profile
                    </p>
                  </motion.div>
                </Link>

                <Link to="/colleges">
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="group p-6 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#0f172a] hover:border-[#3498db] transition-all shadow-sm hover:shadow-blue-200 dark:hover:shadow-none"
                  >
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition">
                      <span className="text-2xl">🏛️</span>
                    </div>
                    <h3 className="font-bold text-lg text-[#1e293b] dark:text-white">
                      Find Colleges
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Browse govt institutions
                    </p>
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <motion.div
                custom={2}
                initial="hidden"
                animate="visible"
                variants={cardAnimation}
                className="bg-white/70 dark:bg-[#1e293b]/70 backdrop-blur-xl border border-white dark:border-gray-800 rounded-[2rem] p-8 shadow-xl"
              >
                <h2 className="text-xl font-bold text-[#1e293b] dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-[#3498db] rounded-full"></span>{" "}
                  Suggested Paths
                </h2>
                <div className="grid gap-4">
                  {recommendations.map((stream, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 10 }}
                      className="flex items-center p-5 rounded-2xl bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mr-4 font-bold text-xl">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold capitalize text-lg">
                          {stream} Stream
                        </h3>
                        <p className="text-xs text-blue-100 font-medium uppercase tracking-wider">
                          Top Match for you
                        </p>
                      </div>
                      <Link
                        to={`/courses?stream=${stream}`}
                        className="bg-white text-[#1e4b6e] px-6 py-2.5 rounded-xl font-bold hover:bg-[#e67e22] hover:text-white transition-all shadow-lg"
                      >
                        Explore
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent Quiz */}
            {recentQuizzes.length > 0 && (
              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={cardAnimation}
                className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-gray-800"
              >
                <h2 className="text-xl font-bold text-[#1e293b] dark:text-white mb-6">
                  History
                </h2>
                <div className="space-y-4">
                  {recentQuizzes.map((quiz, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-2xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4"
                    >
                      <div>
                        <h3 className="font-bold text-[#1e293b] dark:text-white">
                          {quiz.quizType}
                        </h3>
                        <p className="text-xs font-bold text-[#e67e22] mt-1">
                          {new Date(quiz.completedAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs text-gray-500 mb-1">
                          Top Matches
                        </p>
                        <div className="flex flex-wrap md:justify-end gap-2">
                          {quiz.recommendations.map((r, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-[#3498db]/10 text-[#3498db] text-xs font-bold rounded-lg border border-[#3498db]/20"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-8">
            {/* Profile Status */}
            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={cardAnimation}
              className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-8 shadow-xl border-t-4 border-[#e67e22]"
            >
              <h3 className="font-bold text-[#1e293b] dark:text-white mb-6 text-center">
                Profile Strength
              </h3>
              <div className="space-y-5">
                {[
                  {
                    label: "Basic Info",
                    status: "Done",
                    color: "text-green-500",
                  },
                  {
                    label: "Academics",
                    status: "Update",
                    color: "text-[#3498db]",
                    link: "/profile",
                  },
                  {
                    label: "Assessment",
                    status: "Quiz",
                    color: "text-[#e67e22]",
                    link: "/quiz",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-50 dark:bg-[#0f172a] p-3 rounded-xl"
                  >
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {item.label}
                    </span>
                    {item.link ? (
                      <Link
                        to={item.link}
                        className={`text-xs font-black uppercase ${item.color} hover:underline`}
                      >
                        {item.status} →
                      </Link>
                    ) : (
                      <span className="text-xs font-black uppercase text-green-500">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Saved Items */}
            <motion.div
              custom={5}
              initial="hidden"
              animate="visible"
              variants={cardAnimation}
              className="bg-gradient-to-br from-[#1e4b6e] to-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl">⭐</span>
              </div>
              <h3 className="font-bold mb-6 relative z-10 text-xl">
                Saved Library
              </h3>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <Link to="/saved-colleges">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-5 rounded-2xl text-center cursor-pointer transition-all border border-transparent hover:border-white/20"
                  >
                    <span className="text-3xl block mb-1">🏛️</span>
                    <p className="text-3xl font-black">
                      {savedCounts.colleges}
                    </p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-blue-200 mt-1">
                      Saved Colleges
                    </p>
                    <p className="text-[9px] text-blue-300 mt-2 font-semibold">
                      View All →
                    </p>
                  </motion.div>
                </Link>
                <Link to="/saved-courses">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-5 rounded-2xl text-center cursor-pointer transition-all border border-transparent hover:border-white/20"
                  >
                    <span className="text-3xl block mb-1">📚</span>
                    <p className="text-3xl font-black">{savedCounts.courses}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-blue-200 mt-1">
                      Saved Courses
                    </p>
                    <p className="text-[9px] text-blue-300 mt-2 font-semibold">
                      View All →
                    </p>
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            {/* Deadlines */}
            <motion.div
              custom={6}
              initial="hidden"
              animate="visible"
              variants={cardAnimation}
              className="bg-[#e67e22] rounded-[2.5rem] p-8 text-white shadow-xl"
            >
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="animate-pulse">🔔</span> Notifications
              </h3>
              <p className="text-sm font-medium text-orange-50">
                No upcoming deadlines. We'll alert you for new admission dates.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
