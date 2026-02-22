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
  const [expandedCourse, setExpandedCourse] = useState(null);

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
      if (expandedCourse === courseId) setExpandedCourse(null);
    } catch (err) {
      console.error("Error removing course:", err);
    } finally {
      setRemovingId(null);
    }
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
            Please login to view your saved courses.
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
            Loading Saved Courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3498db]/5 dark:bg-[#3498db]/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#e67e22]/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black text-[#1e293b] dark:text-white mb-4 tracking-tight">
            Saved <span className="text-[#e67e22]">Courses</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg font-medium">
            Your bookmarked courses — saved for quick reference.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                Your Collection
              </p>
              <h2 className="text-2xl font-black text-[#1e293b] dark:text-white">
                {user?.name}'s Saved Courses
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                Total Saved
              </p>
              <p className="text-3xl font-black text-[#e67e22]">
                {courses.length}
              </p>
            </div>
          </div>
        </div>

        {/* Course list */}
        {courses.length > 0 ? (
          <div className="space-y-8">
            {courses.map((course, index) => (
              <motion.div
                layout
                key={course._id + index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group p-8 md:p-10 rounded-[3rem] bg-white dark:bg-[#1e293b] shadow-xl hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-[#bae6fd]/50 dark:hover:border-blue-900/30"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="px-4 py-1.5 bg-[#bae6fd] dark:bg-blue-900/30 text-[#1e4b6e] dark:text-[#bae6fd] text-[9px] font-black uppercase tracking-widest rounded-full">
                        {course.stream}
                      </span>
                      <span className="px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-[#e67e22] text-[9px] font-black uppercase tracking-widest rounded-full">
                        {course.duration?.years} Year Program
                      </span>
                      <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                        ♥ Saved{" "}
                        {course.savedAt
                          ? new Date(course.savedAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-[#1e293b] dark:text-white group-hover:text-[#e67e22] transition-colors leading-tight">
                      {course.name}
                    </h3>
                    <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">
                      {course.code}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setExpandedCourse(
                          expandedCourse === course._id ? null : course._id,
                        )
                      }
                      className={`px-6 py-3 rounded-2xl font-black text-sm transition-all transform active:scale-95 shadow-lg ${
                        expandedCourse === course._id
                          ? "bg-[#1e293b] text-white dark:bg-white dark:text-[#1e293b]"
                          : "bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white shadow-blue-500/20"
                      }`}
                    >
                      {expandedCourse === course._id ? "Close" : "Details"}
                    </button>
                    <button
                      onClick={() => removeCourse(course._id)}
                      disabled={removingId === course._id}
                      className="px-6 py-3 rounded-2xl font-black text-sm bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-50"
                    >
                      {removingId === course._id ? "..." : "✕ Remove"}
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base font-medium">
                  {course.description}
                </p>

                <AnimatePresence>
                  {expandedCourse === course._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-100 dark:border-gray-800 grid md:grid-cols-2 gap-8">
                        {/* Left: Career Paths */}
                        <div className="space-y-8">
                          {course.careerPaths?.length > 0 && (
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#e67e22] mb-4 flex items-center gap-2">
                                <span className="w-8 h-[2px] bg-[#e67e22]"></span>{" "}
                                Career Prospects
                              </h4>
                              <div className="grid gap-3">
                                {course.careerPaths.map((career, i) => (
                                  <div
                                    key={i}
                                    className="p-5 rounded-2xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="font-black text-[#1e293b] dark:text-white">
                                        {career.jobTitle}
                                      </span>
                                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-black rounded-lg">
                                        {career.industry}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                      {career.description}
                                    </p>
                                    <div className="text-[#e67e22] font-black text-sm">
                                      ₹
                                      {(
                                        career.averageSalary?.min / 100000
                                      ).toFixed(1)}
                                      L -{" "}
                                      {(
                                        career.averageSalary?.max / 100000
                                      ).toFixed(1)}
                                      L
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Eligibility */}
                          {course.eligibility && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1e4b6e] to-[#0f172a] text-white">
                              <h4 className="text-xs font-black uppercase tracking-widest mb-4 opacity-70">
                                Eligibility
                              </h4>
                              <ul className="space-y-3 text-sm font-bold">
                                <li className="flex justify-between">
                                  <span>Min Marks:</span>{" "}
                                  <span className="text-[#e67e22]">
                                    {course.eligibility.minimumMarks}%
                                  </span>
                                </li>
                                <li className="flex justify-between">
                                  <span>Entrance:</span>{" "}
                                  <span>{course.eligibility.entranceExam}</span>
                                </li>
                                {course.eligibility.requiredSubjects?.length >
                                  0 && (
                                  <li className="flex flex-col gap-2 mt-3">
                                    <span className="opacity-70">
                                      Required Subjects:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                      {course.eligibility.requiredSubjects.map(
                                        (s, i) => (
                                          <span
                                            key={i}
                                            className="px-3 py-1 bg-white/10 rounded-lg text-[10px]"
                                          >
                                            {s}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Right: Skills, Exams, Subjects */}
                        <div className="space-y-8">
                          {course.skills?.length > 0 && (
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#3498db] mb-4 flex items-center gap-2">
                                <span className="w-8 h-[2px] bg-[#3498db]"></span>{" "}
                                Skills
                              </h4>
                              <div className="flex flex-wrap gap-3">
                                {course.skills.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="px-4 py-2 bg-white dark:bg-[#0f172a] border-2 border-gray-100 dark:border-gray-800 rounded-xl text-xs font-black text-gray-500 dark:text-gray-400 hover:border-[#3498db] transition-colors"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {course.governmentExams?.length > 0 && (
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#e67e22] mb-4 flex items-center gap-2">
                                <span className="w-8 h-[2px] bg-[#e67e22]"></span>{" "}
                                Exams
                              </h4>
                              <div className="space-y-3">
                                {course.governmentExams.map((exam, i) => (
                                  <div
                                    key={i}
                                    className="flex gap-3 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border-l-4 border-[#e67e22]"
                                  >
                                    <div className="flex-1">
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

                          {course.subjects?.length > 0 && (
                            <div className="p-6 rounded-2xl border-2 border-[#bae6fd] dark:border-blue-900/30">
                              <h4 className="text-xs font-black uppercase tracking-widest text-[#3498db] mb-4">
                                Key Subjects
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                {course.subjects.map((sub, i) => (
                                  <div
                                    key={i}
                                    className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2"
                                  >
                                    <span className="w-1.5 h-1.5 bg-[#3498db] rounded-full"></span>{" "}
                                    {sub}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-[#1e293b] rounded-[2rem] shadow-lg">
            <p className="text-6xl mb-4">📖</p>
            <p className="text-gray-400 font-black uppercase tracking-widest mb-4">
              No saved courses yet
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Browse courses and click the save button to add them here.
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="px-8 py-3 rounded-xl bg-[#e67e22] text-white font-black text-sm uppercase tracking-widest hover:bg-[#d35400] transition-all"
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedCourses;
