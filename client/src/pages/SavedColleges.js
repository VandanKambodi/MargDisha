import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const SAVED_API = "http://localhost:5000/api/saved";

const SavedColleges = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchSaved = async () => {
      try {
        const res = await axios.get(`${SAVED_API}/colleges`);
        if (res.data.success) setColleges(res.data.colleges);
      } catch (err) {
        console.error("Error fetching saved colleges:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [user]);

  const removeCollege = async (collegeId) => {
    setRemovingId(collegeId);
    try {
      await axios.delete(
        `${SAVED_API}/college/${encodeURIComponent(collegeId)}`,
      );
      setColleges((prev) => prev.filter((c) => c._id !== collegeId));
      if (selectedCollege?._id === collegeId) setSelectedCollege(null);
    } catch (err) {
      console.error("Error removing college:", err);
    } finally {
      setRemovingId(null);
    }
  };

  const streamColors = {
    engineering:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    medical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    law: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    education:
      "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    commerce:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    science: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    arts: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    general: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="text-center p-12 rounded-3xl bg-white dark:bg-[#1e293b] shadow-2xl max-w-md">
          <p className="text-6xl mb-6">🔒</p>
          <h2 className="text-2xl font-black text-[#1e293b] dark:text-white mb-4">
            Login Required
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Please login to view your saved colleges.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 rounded-xl bg-[#e67e22] text-white font-black text-sm uppercase tracking-widest hover:bg-[#d35400] transition-all"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#bae6fd] dark:border-gray-800" />
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#e67e22] absolute top-0 left-0" />
          </div>
          <p className="mt-6 text-gray-500 dark:text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">
            Loading Saved Colleges...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-500 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#3498db]/5 dark:bg-[#3498db]/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#e67e22]/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black text-[#1e293b] dark:text-white mb-4 tracking-tight">
            Saved <span className="text-[#e67e22]">Colleges</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg font-medium">
            Your bookmarked colleges — saved for quick reference.
          </p>
        </div>

        {/* Stats banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                Your Collection
              </p>
              <h2 className="text-2xl font-black text-[#1e293b] dark:text-white">
                {user?.name}'s Saved Colleges
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                Total Saved
              </p>
              <p className="text-3xl font-black text-[#e67e22]">
                {colleges.length}
              </p>
            </div>
          </div>
        </div>

        {/* College grid */}
        {colleges.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {colleges.map((college, index) => (
              <motion.div
                key={college._id + index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                className="group relative p-8 rounded-[2rem] bg-white dark:bg-[#1e293b] shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 hover:border-[#e67e22]/30"
              >
                {/* Saved date badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                    ♥ Saved{" "}
                    {college.savedAt
                      ? new Date(college.savedAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>

                {/* Header */}
                <div className="flex justify-between items-start mb-4 pr-24">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#3498db] text-[9px] font-black uppercase tracking-widest rounded-lg">
                        {college.type}
                      </span>
                      <span
                        className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${streamColors[college.stream] || streamColors.general}`}
                      >
                        {college.stream}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-[#1e293b] dark:text-white group-hover:text-[#e67e22] transition-colors line-clamp-2">
                      {college.name}
                    </h3>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1 mt-1">
                      📍 {college.location?.district}, {college.location?.state}
                    </p>
                  </div>
                </div>

                {/* University */}
                <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    University
                  </p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 line-clamp-1">
                    {college.university}
                  </p>
                </div>

                {/* Courses */}
                <div className="mb-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Courses ({college.totalCourses})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {college.courses?.slice(0, 4).map((c, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800 text-gray-700 dark:text-gray-300 text-[11px] font-bold rounded-lg"
                      >
                        {c.code}
                      </span>
                    ))}
                    {college.totalCourses > 4 && (
                      <span className="px-3 py-1.5 bg-gray-50 dark:bg-[#0f172a] text-[#3498db] text-[11px] font-bold rounded-lg italic">
                        +{college.totalCourses - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setSelectedCollege(college)}
                    className="flex-1 px-4 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest border-2 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#e67e22] hover:text-white hover:border-[#e67e22] transition-all"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => removeCollege(college._id)}
                    disabled={removingId === college._id}
                    className="px-4 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest border-2 border-red-200 dark:border-red-800 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-50"
                  >
                    {removingId === college._id ? "Removing..." : "✕ Remove"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-[#1e293b] rounded-[2rem] shadow-lg">
            <p className="text-6xl mb-4">📚</p>
            <p className="text-gray-400 font-black uppercase tracking-widest mb-4">
              No saved colleges yet
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Browse colleges and click the save button to add them here.
            </p>
            <button
              onClick={() => navigate("/colleges")}
              className="px-8 py-3 rounded-xl bg-[#e67e22] text-white font-black text-sm uppercase tracking-widest hover:bg-[#d35400] transition-all"
            >
              Browse Colleges
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCollege && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCollege(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1e293b] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white p-8 rounded-t-3xl flex justify-between items-start z-10">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-white/20 text-[9px] font-black uppercase tracking-widest rounded-lg">
                      {selectedCollege.type}
                    </span>
                    <span className="px-3 py-1 bg-white/20 text-[9px] font-black uppercase tracking-widest rounded-lg">
                      {selectedCollege.stream}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black mb-2">
                    {selectedCollege.name}
                  </h2>
                  <p className="opacity-90 text-sm">
                    📍 {selectedCollege.location?.district},{" "}
                    {selectedCollege.location?.state}
                  </p>
                  <p className="opacity-75 text-xs mt-1">
                    🎓 {selectedCollege.university}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCollege(null)}
                  className="text-2xl font-black hover:opacity-80 transition flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Modal body */}
              <div className="p-8">
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                      Type
                    </p>
                    <p className="text-xl font-black text-[#1e4b6e] dark:text-blue-400 capitalize">
                      {selectedCollege.type}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                      Stream
                    </p>
                    <p className="text-xl font-black text-purple-600 dark:text-purple-400 capitalize">
                      {selectedCollege.stream}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                      Total Courses
                    </p>
                    <p className="text-xl font-black text-[#e67e22]">
                      {selectedCollege.totalCourses}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-[#1e293b] dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-[#e67e22] rounded-full"></span>
                    Available Courses ({selectedCollege.totalCourses})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedCollege.courses?.map((course, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-black text-[#1e4b6e] dark:text-blue-400 text-sm">
                            {course.name}
                          </p>
                          <span className="text-[9px] font-black uppercase px-2 py-1 bg-white dark:bg-[#0f172a] rounded-lg text-gray-500 flex-shrink-0 ml-2">
                            {course.code}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                          <span>📚 {course.stream}</span>
                          <span>🎓 {course.degree}</span>
                          <span>⏱️ {course.duration}</span>
                          {course.fees && (
                            <span className="text-green-600 dark:text-green-400 font-black">
                              ₹{course.fees.toLocaleString()}/yr
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => removeCollege(selectedCollege._id)}
                    disabled={removingId === selectedCollege._id}
                    className="flex-1 px-6 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    {removingId === selectedCollege._id
                      ? "Removing..."
                      : "✕ Remove from Saved"}
                  </button>
                  <button
                    onClick={() => setSelectedCollege(null)}
                    className="flex-1 px-6 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white shadow-lg shadow-blue-500/20 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedColleges;
