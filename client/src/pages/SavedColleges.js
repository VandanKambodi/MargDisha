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

  // Logic from original code preserved
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
    engineering: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20",
    medical: "bg-red-50 text-red-600 dark:bg-red-900/20",
    law: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
    education: "bg-teal-50 text-teal-600 dark:bg-teal-900/20",
    commerce: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
    science: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20",
    arts: "bg-pink-50 text-pink-600 dark:bg-pink-900/20",
    general: "bg-gray-50 text-gray-600 dark:bg-gray-800",
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-12 rounded-[3rem] bg-white dark:bg-[#1e293b] shadow-2xl max-w-md border border-gray-100 dark:border-gray-800"
        >
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            🔒
          </div>
          <h2 className="text-3xl font-black text-[#1e293b] dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
            Join the community to start building your personalized college
            library.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-4 rounded-2xl bg-[#e67e22] text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all"
          >
            Sign In Now
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="text-center">
          <div className="relative inline-flex mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#bae6fd] dark:border-gray-800" />
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#e67e22] absolute top-0 left-0" />
          </div>
          <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">
            Accessing Your Vault...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-all duration-500 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#3498db]/5 rounded-full blur-[120px] -z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#e67e22]/5 rounded-full blur-[120px] -z-0" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black text-[#1e293b] dark:text-white mb-4 tracking-tight">
              Your <span className="text-[#e67e22]">Library</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl text-lg font-medium">
              Manage and explore the institutions you've shortlisted for your
              future.
            </p>
          </div>
          <div className="bg-white dark:bg-[#1e293b] px-8 py-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#3498db]">
                Shortlisted
              </p>
              <p className="text-3xl font-black text-[#1e293b] dark:text-white">
                {colleges.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-xl">
              ⭐
            </div>
          </div>
        </div>

        {/* College grid */}
        {colleges.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {colleges.map((college, index) => (
              <motion.div
                key={college._id + index}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative p-8 rounded-[3rem] bg-white dark:bg-[#1e293b] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 border border-transparent hover:border-[#bae6fd]/50"
              >
                {/* Save date badge */}
                <div className="absolute top-6 right-8">
                  <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Saved{" "}
                    {college.savedAt
                      ? new Date(college.savedAt).toLocaleDateString("en-GB")
                      : "Recently"}
                  </div>
                </div>

                <div className="flex justify-between items-start mb-6 pr-24">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#3498db] text-[9px] font-black uppercase rounded-lg tracking-widest">
                        {college.type}
                      </span>
                      <span
                        className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${streamColors[college.stream] || streamColors.general}`}
                      >
                        {college.stream}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-[#1e293b] dark:text-white group-hover:text-[#e67e22] transition-colors leading-tight">
                      {college.name}
                    </h3>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1 mt-1">
                      📍 {college.location?.district}, {college.location?.state}
                    </p>
                  </div>
                </div>

                <div className="mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Affiliation
                  </p>
                  <p className="text-sm font-bold text-[#1e293b] dark:text-gray-300 line-clamp-1">
                    {college.university}
                  </p>
                </div>

                <div className="mb-8">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Top Programs
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {college.courses?.slice(0, 4).map((c, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-bold rounded-lg"
                      >
                        {c.code}
                      </span>
                    ))}
                    {college.totalCourses > 4 && (
                      <span className="text-[10px] font-black text-[#3498db] pt-1">
                        +{college.totalCourses - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t-2 border-dashed border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setSelectedCollege(college)}
                    className="flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-[#1e293b] text-white hover:bg-[#3498db] transition-all active:scale-95 shadow-lg"
                  >
                    Full Details
                  </button>
                  <button
                    onClick={() => removeCollege(college._id)}
                    disabled={removingId === college._id}
                    className="px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border-2 border-red-100 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-50"
                  >
                    {removingId === college._id ? "..." : "Remove"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-white dark:bg-[#1e293b] rounded-[4rem] shadow-xl border border-gray-100 dark:border-gray-800"
          >
            <div className="text-6xl mb-6">📂</div>
            <h3 className="text-2xl font-black text-[#1e293b] dark:text-white mb-2">
              No shortlists yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium">
              Explore our vast directory of colleges and save them to compare
              later.
            </p>
            <button
              onClick={() => navigate("/colleges")}
              className="px-12 py-5 rounded-[2rem] bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all"
            >
              Discover Colleges
            </button>
          </motion.div>
        )}
      </div>

      {/* --- SCROLLING MODAL FIX --- */}
      <AnimatePresence>
        {selectedCollege && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCollege(null)}
            className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1e293b] rounded-[3rem] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/10 overflow-hidden"
            >
              {/* FIXED HEADER */}
              <div className="bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white p-8 md:p-10 flex justify-between items-start shrink-0">
                <div className="flex-1 pr-6">
                  <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 bg-white/20 text-[9px] font-black uppercase tracking-widest rounded-lg">
                      {selectedCollege.type}
                    </span>
                    <span className="px-3 py-1 bg-white/20 text-[9px] font-black uppercase tracking-widest rounded-lg">
                      {selectedCollege.stream}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black mb-1">
                    {selectedCollege.name}
                  </h2>
                  <p className="opacity-90 text-sm font-medium">
                    📍 {selectedCollege.location?.district},{" "}
                    {selectedCollege.location?.state}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCollege(null)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-black"
                >
                  ✕
                </button>
              </div>

              {/* SCROLLABLE BODY */}
              <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-[#fdfdfd] dark:bg-[#1e293b] custom-scrollbar">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-[2rem] bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-center">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                      Programs
                    </p>
                    <p className="text-2xl font-black text-[#1e4b6e] dark:text-blue-300">
                      {selectedCollege.totalCourses}
                    </p>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-center">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">
                      Rating
                    </p>
                    <p className="text-2xl font-black text-[#e67e22]">4.2 ★</p>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 text-center">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">
                      Region
                    </p>
                    <p className="text-xl font-black text-purple-600 dark:text-purple-300 capitalize">
                      {selectedCollege.location?.district}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-[#1e293b] dark:text-white mb-6 flex items-center gap-3">
                    <span className="w-2 h-6 bg-[#e67e22] rounded-full" />{" "}
                    Detailed Course List
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedCollege.courses?.map((course, idx) => (
                      <div
                        key={idx}
                        className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 shadow-sm group/item"
                      >
                        <p className="font-black text-[#1e4b6e] dark:text-blue-400 text-base mb-3 leading-tight">
                          {course.name}
                        </p>
                        <div className="flex flex-wrap gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <span>⏱️ {course.duration}</span>
                          <span>🎓 {course.degree}</span>
                          <span className="text-emerald-500 font-black">
                            ₹{course.fees?.toLocaleString()}/yr
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-4" />
              </div>

              {/* FIXED FOOTER */}
              <div className="p-8 bg-gray-50 dark:bg-[#0f172a] border-t border-gray-100 dark:border-gray-800 flex gap-4 shrink-0">
                <button
                  onClick={() => removeCollege(selectedCollege._id)}
                  disabled={removingId === selectedCollege._id}
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all"
                >
                  {removingId === selectedCollege._id
                    ? "Removing..."
                    : "Remove Shortlist"}
                </button>
                <button
                  onClick={() => setSelectedCollege(null)}
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#1e293b] dark:bg-gray-800 text-white active:scale-95 transition-all"
                >
                  Return to Library
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedColleges;
