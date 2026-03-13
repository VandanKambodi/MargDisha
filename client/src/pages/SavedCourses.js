import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const SAVED_API = "http://localhost:5000/api/saved";

const SavedCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchSaved = async () => {
      try {
        const res = await axios.get(`${SAVED_API}/courses`);
        if (res.data.success) setCourses(res.data.courses);
      } catch (err) {
        console.error("Error fetching saved courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [user]);

  const removeCourse = async (courseId) => {
    setRemovingId(courseId);
    try {
      await axios.delete(`${SAVED_API}/course/${encodeURIComponent(courseId)}`);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      if (selectedCourse?._id === courseId) setSelectedCourse(null);
    } catch (err) {
      console.error("Error removing course:", err);
    } finally {
      setRemovingId(null);
    }
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
          <h2 className="text-3xl font-black text-[#1e293b] dark:text-white mb-4 tracking-tight">
            Access Restricted
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
            Log in to sync and manage your saved academic paths.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-4 rounded-2xl bg-[#e67e22] text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all"
          >
            Login to Account
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
            Retrieving Shortlists...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-all duration-500 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3498db]/5 rounded-full blur-[120px] -z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#e67e22]/5 rounded-full blur-[120px] -z-0" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left">
            <h1 className="text-5xl font-black text-[#1e293b] dark:text-white mb-4 tracking-tight">
              Course <span className="text-[#e67e22]">Vault</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl text-lg font-medium">
              Review and manage the degree programs you've bookmarked for your
              career.
            </p>
          </div>
          <div className="bg-white/70 dark:bg-[#1e293b]/70 backdrop-blur-md px-8 py-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#3498db]">
                Saved Programs
              </p>
              <p className="text-3xl font-black text-[#1e293b] dark:text-white">
                {courses.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-xl">
              📖
            </div>
          </div>
        </div>

        {/* Grid Container */}
        {courses.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course._id + index}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative p-8 rounded-[3rem] bg-white dark:bg-[#1e293b] shadow-xl hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-[#bae6fd]/50 overflow-hidden"
              >
                {/* Save Info */}
                <div className="absolute top-6 right-8">
                  <div className="px-4 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-green-100 dark:border-green-800 flex items-center gap-2">
                    Saved{" "}
                    {course.savedAt
                      ? new Date(course.savedAt).toLocaleDateString("en-GB")
                      : "Recently"}
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="pr-20">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#3498db] text-[9px] font-black uppercase rounded-lg tracking-widest">
                        {course.stream}
                      </span>
                      <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-[#e67e22] text-[9px] font-black uppercase rounded-lg tracking-widest">
                        {course.duration?.years || "N/A"} Years
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-[#1e293b] dark:text-white group-hover:text-[#e67e22] transition-colors leading-tight mb-2">
                      {course.name}
                    </h3>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                      {course.code}
                    </p>
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-[#1e293b] text-white hover:bg-[#3498db] transition-all shadow-lg"
                    >
                      Explore Roadmap
                    </button>
                    <button
                      onClick={() => removeCourse(course._id)}
                      disabled={removingId === course._id}
                      className="px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border-2 border-red-50 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-50"
                    >
                      {removingId === course._id ? "..." : "Remove"}
                    </button>
                  </div>
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
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-black text-[#1e293b] dark:text-white mb-2">
              No shortlists yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium max-w-sm mx-auto">
              Explore our curriculum catalog and save courses to map your career
              trajectory.
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="px-12 py-5 rounded-[2rem] bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all"
            >
              Discover Programs
            </button>
          </motion.div>
        )}
      </div>

      {/* --- DETAIL MODAL WITH SCROLLING FIX --- */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCourse(null)}
            className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1e293b] rounded-[3.5rem] max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/10 overflow-hidden"
            >
              {/* FIXED HEADER */}
              <div className="bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white p-8 md:p-10 flex justify-between items-start shrink-0">
                <div className="flex-1 pr-6">
                  <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 bg-white/20 text-[9px] font-black uppercase tracking-widest rounded-lg">
                      {selectedCourse.stream}
                    </span>
                    <span className="px-3 py-1 bg-white/20 text-[9px] font-black uppercase tracking-widest rounded-lg">
                      {selectedCourse.code}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black mb-1">
                    {selectedCourse.name}
                  </h2>
                  <p className="opacity-90 text-sm font-medium tracking-wide">
                    Professional Curriculum Roadmap
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-black"
                >
                  ✕
                </button>
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-[#fdfdfd] dark:bg-[#1e293b]">
                {/* Description Section */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#e67e22] mb-4 flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-[#e67e22]"></span> Overview
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  {/* Left: Career Paths */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#3498db] mb-4 flex items-center gap-2">
                      <span className="w-8 h-[2px] bg-[#3498db]"></span> Job
                      Prospects
                    </h4>
                    {selectedCourse.careerPaths?.map((career, i) => (
                      <div
                        key={i}
                        className="p-6 rounded-[2rem] bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-black text-[#1e293b] dark:text-white">
                            {career.jobTitle}
                          </span>
                          <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[9px] font-black uppercase rounded-lg">
                            High Growth
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          {career.description}
                        </p>
                        <p className="text-[#e67e22] font-black text-sm">
                          Est. ₹
                          {(career.averageSalary?.min / 100000).toFixed(1)}L -{" "}
                          {(career.averageSalary?.max / 100000).toFixed(1)}L /
                          year
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Right: Requirements & Skills */}
                  <div className="space-y-8">
                    {/* Eligibility Card */}
                    <div className="p-8 rounded-[2.5rem] bg-[#1e293b] text-white shadow-xl shadow-blue-900/10">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-6">
                        Program Eligibility
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between border-b border-white/5 pb-3">
                          <span className="text-xs opacity-60">
                            Min Aggregate
                          </span>
                          <span className="text-sm font-black text-[#e67e22]">
                            {selectedCourse.eligibility?.minimumMarks}%
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-3">
                          <span className="text-xs opacity-60">
                            Entrance Exam
                          </span>
                          <span className="text-sm font-black text-blue-300">
                            {selectedCourse.eligibility?.entranceExam}
                          </span>
                        </div>
                        <div className="pt-2">
                          <p className="text-[10px] opacity-60 uppercase mb-3">
                            Core Prerequisites
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCourse.eligibility?.requiredSubjects?.map(
                              (s, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-bold"
                                >
                                  {s}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                        Competencies Acquired
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCourse.skills?.map((skill, i) => (
                          <span
                            key={i}
                            className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Government Exams Section */}
                {selectedCourse.governmentExams?.length > 0 && (
                  <div className="p-8 rounded-[3rem] bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#e67e22] mb-6">
                      Government Opportunity Gateways
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedCourse.governmentExams.map((exam, i) => (
                        <div
                          key={i}
                          className="flex gap-4 p-4 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm"
                        >
                          <span className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-lg">
                            🎖️
                          </span>
                          <div>
                            <p className="font-black text-[#1e293b] dark:text-white text-sm">
                              {exam.examName}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {exam.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-6" />
              </div>

              {/* FIXED FOOTER */}
              <div className="p-8 bg-gray-50 dark:bg-[#0f172a] border-t border-gray-100 dark:border-gray-800 flex gap-4 shrink-0">
                <button
                  onClick={() => removeCourse(selectedCourse._id)}
                  disabled={removingId === selectedCourse._id}
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all"
                >
                  {removingId === selectedCourse._id
                    ? "Removing..."
                    : "Remove from Vault"}
                </button>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#1e293b] dark:bg-gray-800 text-white active:scale-95 transition-all"
                >
                  Back to Library
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedCourses;
