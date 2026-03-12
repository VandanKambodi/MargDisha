import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const API = "http://localhost:5000/api/external-colleges";
const SAVED_API = "http://localhost:5000/api/saved";

const Colleges = () => {
  const { user } = useAuth();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedCollegeIds, setSavedCollegeIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalColleges, setTotalColleges] = useState(0);
  const [limit, setLimit] = useState(10);

  // Filters
  const [filters, setFilters] = useState({
    state: "",
    district: "",
    search: "",
  });
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Detail modal
  const [selectedCollege, setSelectedCollege] = useState(null);

  // ── Fetch saved college IDs on mount (if logged in) ────────────────
  useEffect(() => {
    if (user) {
      axios
        .get(`${SAVED_API}/ids`)
        .then((res) => {
          if (res.data.success)
            setSavedCollegeIds(new Set(res.data.collegeIds));
        })
        .catch((err) => console.error("Error fetching saved IDs:", err));
    } else {
      setSavedCollegeIds(new Set());
    }
  }, [user]);

  // ── Save / Unsave college ──────────────────────────────────────────
  const toggleSaveCollege = async (college) => {
    if (!user) {
      alert("Please login to save colleges");
      return;
    }
    const id = college._id;
    setSavingId(id);
    try {
      if (savedCollegeIds.has(id)) {
        await axios.delete(`${SAVED_API}/college/${encodeURIComponent(id)}`);
        setSavedCollegeIds((prev) => {
          const n = new Set(prev);
          n.delete(id);
          return n;
        });
      } else {
        await axios.post(`${SAVED_API}/college`, { college });
        setSavedCollegeIds((prev) => new Set(prev).add(id));
      }
    } catch (err) {
      console.error("Error saving college:", err);
    } finally {
      setSavingId(null);
    }
  };

  // ── Fetch states on mount ──────────────────────────────────────────
  useEffect(() => {
    axios
      .get(`${API}/filters/states`)
      .then((res) => {
        if (res.data.success) setStates(res.data.states);
      })
      .catch((err) => console.error("Error fetching states:", err));
  }, []);

  // ── Fetch districts when state changes ─────────────────────────────
  useEffect(() => {
    if (filters.state) {
      axios
        .get(`${API}/filters/districts/${encodeURIComponent(filters.state)}`)
        .then((res) => {
          if (res.data.success) setDistricts(res.data.districts);
        })
        .catch((err) => console.error("Error fetching districts:", err));
    } else {
      setDistricts([]);
    }
  }, [filters.state]);

  // ── Fetch colleges ─────────────────────────────────────────────────
  const fetchColleges = useCallback(async () => {
    setLoading(true);
    setError(null);
    setColleges([]);
    setTotalColleges(0);
    setTotalPages(1);
    try {
      const params = new URLSearchParams({ page: currentPage, limit });
      if (filters.state) params.set("state", filters.state);
      if (filters.district) params.set("district", filters.district);
      if (filters.search) params.set("search", filters.search);

      const res = await axios.get(`${API}?${params}`);
      if (res.data.success) {
        setColleges(res.data.colleges);
        setTotalPages(res.data.pagination.totalPages);
        setTotalColleges(res.data.pagination.totalColleges);
      }
    } catch (err) {
      console.error("Error fetching colleges:", err);
      setError("Failed to load colleges. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  // ── Filter handlers ────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "state") next.district = "";
      return next;
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ state: "", district: "", search: "" });
    setDistricts([]);
    setCurrentPage(1);
  };

  // ── Pagination ─────────────────────────────────────────────────────
  const goToPage = (p) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Debounced search ───────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search)
        handleFilterChange("search", searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Stream badge colour ────────────────────────────────────────────
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

  // ── Page numbers generator ─────────────────────────────────────────
  const getPageNumbers = () => {
    const pages = [];
    const maxShow = 7;
    if (totalPages <= maxShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) {
        start = 2;
        end = 5;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages - 1;
      }
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // ═════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-500 relative overflow-hidden">
      {/* Background decor */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#3498db]/5 dark:bg-[#3498db]/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#e67e22]/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black text-[#1e293b] dark:text-white mb-4 tracking-tight">
            College <span className="text-[#e67e22]">Navigator</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg font-medium">
            Browse 38,000+ Indian colleges live from official AISHE data.
          </p>
        </div>

        {/* ── Filters ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-8 rounded-[2.5rem] bg-white dark:bg-[#1e293b] shadow-2xl shadow-blue-900/5 border border-gray-100 dark:border-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                Search
              </label>
              <input
                type="text"
                placeholder="College name..."
                className="w-full pl-4 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-[#e67e22] outline-none transition-all font-bold text-sm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                State
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-[#3498db] outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                value={filters.state}
                onChange={(e) => handleFilterChange("state", e.target.value)}
              >
                <option value="">All States</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                District
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-[#3498db] outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                value={filters.district}
                onChange={(e) => handleFilterChange("district", e.target.value)}
                disabled={!filters.state}
              >
                <option value="">All Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Per page */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                Per Page
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-[#3498db] outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  resetFilters();
                  setSearchInput("");
                }}
                className="w-full px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest bg-[#e67e22] text-white hover:bg-[#d35400] transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Results banner ─────────────────────────────────────────── */}
        <div className="mb-8 px-2">
          <div className="mb-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                  Showing colleges from
                </p>
                <h2 className="text-2xl font-black text-[#1e293b] dark:text-white">
                  {filters.district ||
                    filters.state ||
                    (filters.search
                      ? `Search: "${filters.search}"`
                      : "Delhi (default)")}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                  Total Found
                </p>
                <p className="text-3xl font-black text-[#e67e22]">
                  {totalColleges}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">
            <span>
              Page{" "}
              <span className="text-[#3498db]">
                {currentPage}/{totalPages}
              </span>{" "}
              &bull; {limit} per page
            </span>
            <span>
              Showing {totalColleges === 0 ? 0 : (currentPage - 1) * limit + 1}-
              {Math.min(currentPage * limit, totalColleges)} of {totalColleges}
            </span>
          </div>
        </div>

        {/* ── Loading ────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="relative inline-flex">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#bae6fd] dark:border-gray-800" />
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#e67e22] absolute top-0 left-0" />
              </div>
              <p className="mt-6 text-gray-500 dark:text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">
                Fetching from API...
              </p>
            </div>
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────────────── */}
        {error && (
          <div className="mb-8 p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
          </div>
        )}

        {/* ── College grid ───────────────────────────────────────────── */}
        {!loading && colleges.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {colleges.map((college, index) => (
              <motion.div
                key={college._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                className="group relative p-8 rounded-[2rem] bg-white dark:bg-[#1e293b] shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 hover:border-[#e67e22]/30"
              >
                {/* Header row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
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
                      📍 {college.location.district}, {college.location.state}
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

                {/* Courses (from external API, based on college type) */}
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
                    View Courses
                  </button>
                  <button
                    onClick={() => toggleSaveCollege(college)}
                    disabled={savingId === college._id}
                    className={`px-4 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest border-2 transition-all ${
                      savedCollegeIds.has(college._id)
                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500 hover:bg-red-100"
                        : "border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                    } disabled:opacity-50`}
                  >
                    {savingId === college._id
                      ? "..."
                      : savedCollegeIds.has(college._id)
                        ? "♥ Saved"
                        : "♡ Save"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────────── */}
        {!loading && colleges.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-[#1e293b] rounded-[2rem] shadow-lg">
            <p className="text-6xl mb-4">🏫</p>
            <p className="text-gray-400 font-black uppercase tracking-widest mb-4">
              No colleges found
            </p>
            <button
              onClick={() => {
                resetFilters();
                setSearchInput("");
              }}
              className="text-[#e67e22] font-black uppercase text-sm tracking-widest hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex items-center justify-center gap-2 flex-wrap"
          >
            {/* Prev */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest bg-white dark:bg-[#1e293b] border-2 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3498db] hover:text-white hover:border-[#3498db] transition-all"
            >
              ← Prev
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span
                  key={`dots-${i}`}
                  className="px-2 text-gray-400 font-bold"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`px-4 py-2 rounded-lg font-black text-xs transition-all ${
                    currentPage === p
                      ? "bg-[#e67e22] text-white shadow-lg shadow-orange-500/20"
                      : "bg-white dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest bg-white dark:bg-[#1e293b] border-2 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3498db] hover:text-white hover:border-[#3498db] transition-all"
            >
              Next →
            </button>
          </motion.div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DETAIL MODAL  –  shows courses from external API
         ══════════════════════════════════════════════════════════════════ */}
      {/* --- COLLEGE DETAIL MODAL WITH SCROLLING FIX --- */}
      <AnimatePresence>
        {selectedCollege && (
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
                onClick={() => setSelectedCollege(null)}
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
                      {selectedCollege.type}
                    </span>
                    <span
                      className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg ${streamColors[selectedCollege.stream] || streamColors.general}`}
                    >
                      {selectedCollege.stream}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-[#1e293b] dark:text-white leading-tight mb-2">
                    {selectedCollege.name}
                  </h2>
                  <p className="text-gray-400 font-bold uppercase tracking-widest mb-2">
                    🎓 {selectedCollege.university}
                  </p>
                  <p className="text-gray-500 font-bold">
                    📍 {selectedCollege.location.district},{" "}
                    {selectedCollege.location.state}
                  </p>
                </div>
                {/* Info Cards Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-12">
                  <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      College Type
                    </p>
                    <p className="text-lg font-black text-[#1e4b6e] dark:text-blue-400 capitalize">
                      {selectedCollege.type}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Stream
                    </p>
                    <p className="text-lg font-black text-purple-600 dark:text-purple-400 capitalize">
                      {selectedCollege.stream}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Total Courses
                    </p>
                    <p className="text-lg font-black text-[#e67e22]">
                      {selectedCollege.totalCourses}
                    </p>
                  </div>
                </div>
                {/* Location & Category */}
                <div className="grid md:grid-cols-2 gap-4 mb-12">
                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Category
                    </p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {selectedCollege.category || "N/A"}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Full Address
                    </p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {selectedCollege.location.address || "N/A"}
                    </p>
                  </div>
                </div>
                {/* Courses Section */}
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
                          <span className="text-green-600 dark:text-green-400 font-black">
                            ₹{course.fees?.toLocaleString()}/yr
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Note */}
                <div className="mt-8 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400">
                    ℹ️ Course data is derived from the college type. Actual
                    courses may vary — check the official college website for
                    the latest offerings.
                  </p>
                </div>
                {/* Save Button */}
                <button
                  onClick={() => toggleSaveCollege(selectedCollege)}
                  disabled={savingId === selectedCollege._id}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${
                    savedCollegeIds.has(selectedCollege._id)
                      ? "bg-red-500 text-white shadow-red-500/20"
                      : "bg-[#e67e22] text-white shadow-orange-500/20"
                  } disabled:opacity-50 mt-6`}
                >
                  {savingId === selectedCollege._id
                    ? "Saving..."
                    : savedCollegeIds.has(selectedCollege._id)
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

export default Colleges;
