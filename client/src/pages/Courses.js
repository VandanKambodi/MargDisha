import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const API = "http://localhost:5000/api/external-colleges";
const SAVED_API = "http://localhost:5000/api/saved";
const FILTERS_STORAGE_KEY = "coursesFilters";

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedCourseIds, setSavedCourseIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [limit, setLimit] = useState(10);

  const [filters, setFilters] = useState({
    state: "",
    district: "",
    stream: "",
    degree: "",
    search: "",
  });
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [districtLoading, setDistrictLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);

  // Initialize filters from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (savedFilters) {
        try {
          setFilters(JSON.parse(savedFilters));
        } catch (err) {
          console.error("Error parsing saved filters:", err);
        }
      }
    } else {
      // Clear filters from localStorage when user logs out
      localStorage.removeItem(FILTERS_STORAGE_KEY);
      setFilters({
        state: "",
        district: "",
        stream: "",
        degree: "",
        search: "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      axios
        .get(`${SAVED_API}/ids`)
        .then((res) => {
          if (res.data.success) setSavedCourseIds(new Set(res.data.courseIds));
        })
        .catch((err) => console.error("Error fetching saved IDs:", err));
    } else {
      setSavedCourseIds(new Set());
    }
  }, [user]);

  const toggleSaveCourse = async (course) => {
    if (!user) {
      alert("Please login to save courses");
      return;
    }
    const id = course._id;
    setSavingId(id);
    try {
      if (savedCourseIds.has(id)) {
        await axios.delete(`${SAVED_API}/course/${encodeURIComponent(id)}`);
        setSavedCourseIds((prev) => {
          const n = new Set(prev);
          n.delete(id);
          return n;
        });
      } else {
        await axios.post(`${SAVED_API}/course`, { course });
        setSavedCourseIds((prev) => new Set(prev).add(id));
      }
    } catch (err) {
      console.error("Error saving course:", err);
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    axios
      .get(`${API}/filters/states`)
      .then((res) => {
        if (res.data.success) setStates(res.data.states);
      })
      .catch((err) => console.error("Error fetching states:", err));
  }, []);

  useEffect(() => {
    if (filters.state) {
      setDistrictLoading(true);
      axios
        .get(`${API}/filters/districts/${encodeURIComponent(filters.state)}`)
        .then((res) => {
          if (res.data.success) {
            setDistricts(res.data.districts || []);
          }
        })
        .catch((err) => {
          console.error("Error fetching districts:", err);
          setDistricts([]);
        })
        .finally(() => setDistrictLoading(false));
    } else {
      setDistricts([]);
      setDistrictLoading(false);
    }
  }, [filters.state]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: currentPage, limit });
      if (filters.state) params.set("state", filters.state);
      if (filters.district) params.set("district", filters.district);
      if (filters.stream) params.set("stream", filters.stream);
      if (filters.degree) params.set("degree", filters.degree);
      if (filters.search) params.set("search", filters.search);

      const res = await axios.get(`${API}/all-courses?${params}`);
      if (res.data.success) {
        setCourses(res.data.courses);
        setTotalPages(res.data.pagination.totalPages);
        setTotalCourses(res.data.pagination.totalColleges);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "state") next.district = "";
      // Save to localStorage
      if (user) {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    const defaultFilters = { state: "", district: "", stream: "", degree: "", search: "" };
    setFilters(defaultFilters);
    localStorage.removeItem(FILTERS_STORAGE_KEY);
    setDistricts([]);
    setCurrentPage(1);
  };

  const goToPage = (p) => {
    setCurrentPage(p);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-500 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3498db]/5 rounded-full blur-[120px] -z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#e67e22]/5 rounded-full blur-[120px] -z-0" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-black text-[#1e293b] dark:text-white mb-4 tracking-tight">
              Academic <span className="text-[#e67e22]">Catalog</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-lg font-medium">
              Explore professional degree programs and career opportunities
              across India.
            </p>
          </motion.div>

          <div className="w-full lg:max-w-sm">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl focus:ring-2 focus:ring-[#e67e22] outline-none transition-all font-bold text-gray-700 dark:text-white"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#e67e22] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:sticky lg:top-24"
          >
            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#1e293b] shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-[#1e293b] dark:text-white uppercase tracking-tighter flex items-center gap-2">
                  <span className="w-2 h-6 bg-[#e67e22] rounded-full" /> Filters
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-black uppercase text-red-500 hover:underline"
                >
                  Reset
                </button>
              </div>
              <div className="space-y-6">
                <FilterSelect
                  label="State"
                  value={filters.state}
                  onChange={(v) => handleFilterChange("state", v)}
                  options={states}
                />
                <div className="relative group">
                  {/* <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                    District
                  </label>
                  <select
                    value={filters.district}
                    onChange={(e) =>
                      handleFilterChange("district", e.target.value)
                    }
                    disabled={!filters.state || districtLoading}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-[#3498db] outline-none font-bold appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {districtLoading ? "Loading..." : "All Districts"}
                    </option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select> */}
                </div>
                <FilterSelect
                  label="Stream"
                  value={filters.stream}
                  onChange={(v) => handleFilterChange("stream", v)}
                  options={[
                    "Engineering",
                    "Medical",
                    "Science",
                    "Commerce",
                    "Arts",
                    "Law",
                    "Education",
                  ]}
                  disabled={!filters.state}
                />
                <FilterSelect
                  label="Degree Level"
                  value={filters.degree}
                  onChange={(v) => handleFilterChange("degree", v)}
                  options={["Bachelor", "Master", "Diploma"]}
                  disabled={!filters.state}
                />
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-3">
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] mb-8 px-4">
              Directory:{" "}
              <span className="text-[#3498db]">
                {totalCourses} Programs Found
              </span>
            </p>

            {loading ? (
              <div className="flex justify-center items-center py-32">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-[#bae6fd] border-t-[#e67e22] rounded-full"
                />
              </div>
            ) : error ? (
              <div className="p-12 text-center bg-red-50 dark:bg-red-900/10 rounded-[3rem] text-red-500 font-bold border border-red-100">
                {error}
              </div>
            ) : !filters.state && !filters.district && !filters.stream && !filters.degree && !filters.search ? (
              <div className="p-16 text-center bg-blue-50 dark:bg-blue-900/10 rounded-[3rem] border border-blue-200 dark:border-blue-800">
                <svg className="w-16 h-16 text-[#3498db] mx-auto mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m6.364 1.636l-.707-.707M21 12h-1m1.364 6.364l-.707-.707M12 21v1m-6.364-1.636l.707-.707M3 12h1M3.636 5.636l.707.707" />
                </svg>
                <h3 className="text-2xl font-black text-[#3498db] dark:text-blue-400 mb-3">
                  Start Exploring
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-bold max-w-md mx-auto">
                  Select one or more filters to discover professional degree programs and career opportunities.
                </p>
              </div>
            ) : courses.length === 0 ? (
              <div className="p-16 text-center bg-amber-50 dark:bg-amber-900/10 rounded-[3rem] border border-amber-200 dark:border-amber-800">
                <svg className="w-16 h-16 text-amber-500 mx-auto mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mb-3">
                  No Programs Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-bold max-w-md mx-auto mb-6">
                  We couldn't find any programs matching your current filters. Try adjusting your selection.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-amber-500 text-white font-black uppercase text-xs rounded-2xl hover:bg-amber-600 transition-colors shadow-lg"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                  {courses.map((course, idx) => (
                    <motion.div
                      key={course._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group p-8 rounded-[3rem] bg-white dark:bg-[#1e293b] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
                      onClick={() => setSelectedCourse(course)}
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-[#bae6fd] dark:bg-blue-900/30 text-[#1e4b6e] text-[9px] font-black uppercase rounded-lg">
                              {course.stream}
                            </span>
                            <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-[#e67e22] text-[9px] font-black uppercase rounded-lg">
                              {course.degree}
                            </span>
                          </div>
                          <h3 className="text-2xl font-black text-[#1e293b] dark:text-white group-hover:text-[#e67e22] transition-colors mb-1">
                            {course.name}
                          </h3>
                          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                            {course.code}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveCourse(course);
                            }}
                            className={`p-4 rounded-2xl transition-all shadow-lg ${savedCourseIds.has(course._id) ? "bg-[#e67e22] text-white" : "bg-gray-50 dark:bg-[#0f172a] text-gray-400 hover:text-[#e67e22]"}`}
                            disabled={savingId === course._id}
                          >
                            <svg
                              className="w-5 h-5"
                              fill={
                                savedCourseIds.has(course._id)
                                  ? "currentColor"
                                  : "none"
                              }
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                              />
                            </svg>
                          </button>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                              Annual Fee
                            </p>
                            <p className="text-xl font-black text-[#1e4b6e] dark:text-[#bae6fd]">
                              ₹{course.fees?.toLocaleString() || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 flex justify-between items-center text-[#3498db] text-xs font-black uppercase tracking-widest">
                        <span className="truncate flex items-center gap-2 text-gray-500">
                          🏛️ {course.collegeName}
                        </span>
                        <span>View Details →</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-16">
                    <PageButton
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      label="Prev"
                    />
                    <div className="bg-white dark:bg-[#1e293b] p-1.5 rounded-2xl shadow-lg border border-gray-100 flex gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let p =
                            totalPages <= 5
                              ? i + 1
                              : currentPage <= 3
                                ? i + 1
                                : currentPage >= totalPages - 2
                                  ? totalPages - 4 + i
                                  : currentPage - 2 + i;
                          return p > 0 && p <= totalPages ? (
                            <button
                              key={p}
                              onClick={() => goToPage(p)}
                              className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === p ? "bg-[#3498db] text-white shadow-lg" : "text-gray-400 hover:text-[#3498db]"}`}
                            >
                              {p}
                            </button>
                          ) : null;
                        },
                      )}
                    </div>
                    <PageButton
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      label="Next"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- DETAIL MODAL WITH SCROLLING FIX --- */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#1e293b] rounded-[3rem] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative border border-white dark:border-gray-800 overflow-hidden"
            >
              {/* Close Button - Fixed Position */}
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-6 right-8 w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-[#0f172a] text-gray-400 hover:text-red-500 transition-colors z-50 font-black"
              >
                ✕
              </button>

              {/* Scrollable Content Container */}
              <div className="overflow-y-auto p-10 md:p-14 pt-16 scrollbar-hide">
                {/* Header Section */}
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-[#3498db] text-[10px] font-black uppercase rounded-lg">
                      {selectedCourse.stream}
                    </span>
                    <span className="px-4 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-[#e67e22] text-[10px] font-black uppercase rounded-lg">
                      {selectedCourse.degree}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-[#1e293b] dark:text-white leading-tight mb-2">
                    {selectedCourse.name}
                  </h2>
                  <p className="text-gray-400 font-bold uppercase tracking-widest mb-2">
                    {selectedCourse.code}
                  </p>
                  <p className="text-gray-500 font-bold">
                    🏛️ {selectedCourse.collegeName}
                  </p>
                </div>

                {/* Info Cards Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-12">
                  <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Stream
                    </p>
                    <p className="text-lg font-black text-[#1e4b6e] dark:text-blue-400 capitalize">
                      {selectedCourse.stream}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Degree Level
                    </p>
                    <p className="text-lg font-black text-[#e67e22] capitalize">
                      {selectedCourse.degree}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Annual Fee
                    </p>
                    <p className="text-lg font-black text-purple-600 dark:text-purple-400">
                      ₹{selectedCourse.fees?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Academic Details */}
                <div className="grid md:grid-cols-2 gap-4 mb-12">
                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Duration
                    </p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {selectedCourse.duration || "N/A"}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      College Type
                    </p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">
                      {selectedCourse.collegeType || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Institutional Context */}
                <div className="mb-12">
                  <h3 className="text-xl font-black text-[#1e293b] dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-[#3498db] rounded-full"></span>
                    Institutional Details
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        College Name
                      </p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {selectedCourse.collegeName}
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        University
                      </p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {selectedCourse.university || "N/A"}
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        Location
                      </p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {selectedCourse.location?.district}, {selectedCourse.location?.state}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={() => {
                    toggleSaveCourse(selectedCourse);
                    setSelectedCourse(null);
                  }}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${
                    savedCourseIds.has(selectedCourse._id)
                      ? "bg-red-500 text-white shadow-red-500/20"
                      : "bg-[#e67e22] text-white shadow-orange-500/20"
                  } disabled:opacity-50`}
                >
                  {savedCourseIds.has(selectedCourse._id)
                    ? "♥ Remove from Library"
                    : "♡ Save to Roadmap"}
                </button>

                <div className="h-10" /> {/* Bottom Spacing */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-components ---
const FilterSelect = ({ label, value, onChange, options, disabled = false }) => (
  <div className="relative group">
    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-[#e67e22] outline-none font-bold appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="">All {label}s</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const PageButton = ({ onClick, disabled, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-6 py-3 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-100 font-black text-[10px] uppercase tracking-widest disabled:opacity-30 shadow-md"
  >
    {label}
  </button>
);

const ModalSection = ({ title, items, icon }) => (
  <div className="space-y-6">
    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#3498db] flex items-center gap-2">
      <span className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-lg">
        {icon}
      </span>{" "}
      {title}
    </h3>
    <div className="grid grid-cols-1 gap-3">
      {Object.entries(items).map(([key, value]) => (
        <div
          key={key}
          className="bg-gray-50 dark:bg-[#0f172a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800"
        >
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
            {key}
          </p>
          <p className="text-sm font-black text-[#1e293b] dark:text-white">
            {value}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export default Courses;
