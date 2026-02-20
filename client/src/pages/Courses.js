import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    stream: searchParams.get("stream") || "",
    degree: "",
  });

  const sampleCourses = [
    {
      _id: "1",
      name: "Bachelor of Science in Physics",
      code: "B.Sc Physics",
      stream: "science",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "A comprehensive program covering fundamental and advanced concepts in physics, preparing students for research and industry careers.",
      eligibility: {
        minimumMarks: 60,
        requiredSubjects: ["Physics", "Chemistry", "Mathematics"],
        entranceExam: "None",
      },
      careerPaths: [
        {
          jobTitle: "Research Scientist",
          industry: "Research & Development",
          averageSalary: { min: 400000, max: 800000 },
          description: "Conduct scientific research in physics and related fields",
        },
        {
          jobTitle: "Physics Teacher",
          industry: "Education",
          averageSalary: { min: 300000, max: 600000 },
          description: "Teach physics at school or college level",
        },
        {
          jobTitle: "Data Analyst",
          industry: "Technology",
          averageSalary: { min: 350000, max: 700000 },
          description: "Analyze complex data using mathematical and statistical methods",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "Master of Science in Physics",
          degree: "master",
          description: "Advanced study in specialized physics areas",
        },
        {
          courseName: "Master of Technology",
          degree: "master",
          description: "Applied physics and engineering",
        },
      ],
      governmentExams: [
        {
          examName: "CSIR NET",
          description: "For research fellowships and lectureship",
          eligibility: "Graduate in Physics",
        },
        {
          examName: "GATE Physics",
          description: "For M.Tech admissions and PSU jobs",
          eligibility: "B.Sc Physics",
        },
      ],
      skills: [
        "Analytical Thinking",
        "Mathematical Skills",
        "Problem Solving",
        "Research Methods",
      ],
      subjects: [
        "Classical Mechanics",
        "Quantum Physics",
        "Thermodynamics",
        "Electromagnetism",
      ],
    },
    {
      _id: "2",
      name: "Bachelor of Commerce",
      code: "B.Com",
      stream: "commerce",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "A comprehensive business program covering accounting, finance, economics, and business management principles.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["Mathematics", "English"],
        entranceExam: "None",
      },
      careerPaths: [
        {
          jobTitle: "Chartered Accountant",
          industry: "Finance & Accounting",
          averageSalary: { min: 600000, max: 1500000 },
          description: "Provide accounting, auditing, and financial advisory services",
        },
        {
          jobTitle: "Financial Analyst",
          industry: "Banking & Finance",
          averageSalary: { min: 400000, max: 900000 },
          description: "Analyze financial data and market trends",
        },
        {
          jobTitle: "Business Manager",
          industry: "Corporate",
          averageSalary: { min: 500000, max: 1200000 },
          description: "Manage business operations and strategy",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "Master of Commerce",
          degree: "master",
          description: "Advanced commerce and business studies",
        },
        {
          courseName: "MBA",
          degree: "master",
          description: "Master of Business Administration",
        },
      ],
      governmentExams: [
        {
          examName: "CA Foundation",
          description: "First level of Chartered Accountancy",
          eligibility: "Class 12 passed",
        },
        {
          examName: "Banking Exams",
          description: "For banking sector jobs",
          eligibility: "Graduate",
        },
      ],
      skills: [
        "Financial Analysis",
        "Accounting",
        "Business Communication",
        "Strategic Thinking",
      ],
      subjects: [
        "Financial Accounting",
        "Business Economics",
        "Corporate Law",
        "Taxation",
      ],
    },
    {
      _id: "3",
      name: "Bachelor of Arts in English Literature",
      code: "BA English",
      stream: "arts",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "Study of English language, literature, and critical analysis of literary works from various periods and cultures.",
      eligibility: {
        minimumMarks: 45,
        requiredSubjects: ["English"],
        entranceExam: "None",
      },
      careerPaths: [
        {
          jobTitle: "Content Writer",
          industry: "Media & Publishing",
          averageSalary: { min: 250000, max: 600000 },
          description: "Create written content for various media platforms",
        },
        {
          jobTitle: "English Teacher",
          industry: "Education",
          averageSalary: { min: 300000, max: 700000 },
          description: "Teach English language and literature",
        },
        {
          jobTitle: "Journalist",
          industry: "Media",
          averageSalary: { min: 300000, max: 800000 },
          description: "Report news and write articles for newspapers and magazines",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "Master of Arts in English",
          degree: "master",
          description: "Advanced study of English literature",
        },
        {
          courseName: "Master of Journalism",
          degree: "master",
          description: "Specialized journalism training",
        },
      ],
      governmentExams: [
        {
          examName: "UGC NET English",
          description: "For lectureship and research",
          eligibility: "MA English",
        },
        {
          examName: "Civil Services",
          description: "For administrative services",
          eligibility: "Graduate",
        },
      ],
      skills: [
        "Writing Skills",
        "Critical Analysis",
        "Communication",
        "Research",
      ],
      subjects: [
        "British Literature",
        "American Literature",
        "Indian English Literature",
        "Literary Criticism",
      ],
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setCourses(sampleCourses);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesStream = !filters.stream || course.stream === filters.stream;
    const matchesDegree = !filters.degree || course.degree === filters.degree;
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStream && matchesDegree && matchesSearch;
  });

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#bae6fd] dark:border-gray-800"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#e67e22] absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-gray-500 dark:text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">
            Loading Course Catalog...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-500 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3498db]/5 dark:bg-[#3498db]/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#e67e22]/5 dark:bg-[#e67e22]/5 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header Section with Workable Search */}
        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-black text-[#1e293b] dark:text-white mb-4 tracking-tight">
              Academic <span className="text-[#e67e22]">Catalog</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-lg font-medium">
              Explore deep insights into your potential career paths, subjects, and government exam opportunities.
            </p>
          </div>
          
          {/* SEARCH FEATURE: Positioned on the right side of the header */}
          <div className="w-full lg:max-w-sm">
             <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Search courses or codes..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl shadow-blue-900/5 focus:ring-2 focus:ring-[#e67e22] outline-none transition-all font-bold text-gray-700 dark:text-white placeholder-gray-400"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#e67e22] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-10 items-start">
          {/* --- SIDEBAR FILTERS --- */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:sticky lg:top-10">
            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#1e293b] shadow-2xl shadow-blue-900/5 border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-black text-[#1e293b] dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
                <span className="w-2 h-6 bg-[#e67e22] rounded-full"></span> Filters
              </h3>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">Stream</label>
                  <select
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#0f172a] text-gray-700 dark:text-white focus:ring-2 focus:ring-[#e67e22] outline-none transition-all font-bold appearance-none cursor-pointer shadow-sm"
                    value={filters.stream}
                    onChange={(e) => handleFilterChange("stream", e.target.value)}
                  >
                    <option value="">All Streams</option>
                    <option value="science">Science</option>
                    <option value="commerce">Commerce</option>
                    <option value="arts">Arts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">Degree</label>
                  <select
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#0f172a] text-gray-700 dark:text-white focus:ring-2 focus:ring-[#3498db] outline-none transition-all font-bold appearance-none cursor-pointer shadow-sm"
                    value={filters.degree}
                    onChange={(e) => handleFilterChange("degree", e.target.value)}
                  >
                    <option value="">All Degrees</option>
                    <option value="bachelor">Bachelor's</option>
                    <option value="master">Master's</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* --- COURSE LISTING --- */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8 px-4">
              <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">
                Found: <span className="text-[#3498db]">{filteredCourses.length} Programs</span>
              </p>
            </div>

            <div className="space-y-10">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <motion.div
                    layout
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-8 md:p-10 rounded-[3rem] bg-white dark:bg-[#1e293b] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border border-transparent hover:border-[#bae6fd]/50 dark:hover:border-blue-900/30"
                  >
                    {/* ... (Existing Course Card Content remains exactly the same as previous code) ... */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="px-4 py-1.5 bg-[#bae6fd] dark:bg-blue-900/30 text-[#1e4b6e] dark:text-[#bae6fd] text-[9px] font-black uppercase tracking-widest rounded-full">
                            {course.stream}
                          </span>
                          <span className="px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-[#e67e22] text-[9px] font-black uppercase tracking-widest rounded-full">
                            {course.duration.years} Year Program
                          </span>
                        </div>
                        <h3 className="text-3xl font-black text-[#1e293b] dark:text-white group-hover:text-[#e67e22] transition-colors leading-tight">
                          {course.name}
                        </h3>
                        <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">{course.code}</p>
                      </div>

                      <button
                        onClick={() => setSelectedCourse(selectedCourse === course._id ? null : course._id)}
                        className={`px-8 py-4 rounded-2xl font-black text-sm transition-all transform active:scale-95 shadow-2xl ${
                          selectedCourse === course._id
                            ? "bg-[#1e293b] text-white dark:bg-white dark:text-[#1e293b]"
                            : "bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white shadow-blue-500/20"
                        }`}
                      >
                        {selectedCourse === course._id ? "Close Brief" : "Explore Detail"}
                      </button>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                      {course.description}
                    </p>

                    <AnimatePresence>
                      {selectedCourse === course._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-10 pt-10 border-t-2 border-dashed border-gray-100 dark:border-gray-800 grid md:grid-cols-2 gap-10">
                            
                            {/* Left Detail Column */}
                            <div className="space-y-10">
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#e67e22] mb-6 flex items-center gap-2">
                                  <span className="w-8 h-[2px] bg-[#e67e22]"></span> Career Prospects
                                </h4>
                                <div className="grid gap-4">
                                  {course.careerPaths.map((career, i) => (
                                    <div key={i} className="p-6 rounded-3xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 hover:bg-white transition-all shadow-sm">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-black text-[#1e293b] dark:text-white text-base">{career.jobTitle}</span>
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-black rounded-lg">High Growth</span>
                                      </div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{career.description}</p>
                                      <div className="text-[#e67e22] font-black text-sm italic">
                                        Est. Salary: ₹{(career.averageSalary.min / 100000).toFixed(1)}L - {(career.averageSalary.max / 100000).toFixed(1)}L
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#1e4b6e] to-[#0f172a] text-white">
                                <h4 className="text-xs font-black uppercase tracking-widest mb-4 opacity-70">Eligibility Criteria</h4>
                                <ul className="space-y-3 text-sm font-bold">
                                  <li className="flex justify-between"><span>Minimum Marks:</span> <span className="text-[#e67e22]">{course.eligibility.minimumMarks}%</span></li>
                                  <li className="flex justify-between"><span>Entrance Exam:</span> <span>{course.eligibility.entranceExam}</span></li>
                                  <li className="flex flex-col gap-2 mt-4">
                                    <span className="opacity-70">Required Subjects:</span>
                                    <div className="flex flex-wrap gap-2">
                                      {course.eligibility.requiredSubjects.map((s, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-[10px]">{s}</span>
                                      ))}
                                    </div>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Right Detail Column */}
                            <div className="space-y-10">
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#3498db] mb-6 flex items-center gap-2">
                                  <span className="w-8 h-[2px] bg-[#3498db]"></span> Core Industry Skills
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                  {course.skills.map((skill, i) => (
                                    <span key={i} className="px-5 py-3 bg-white dark:bg-[#0f172a] border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-black text-gray-500 dark:text-gray-400 shadow-sm hover:border-[#3498db] transition-colors">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#e67e22] mb-6 flex items-center gap-2">
                                  <span className="w-8 h-[2px] bg-[#e67e22]"></span> Competitive Exams
                                </h4>
                                <div className="space-y-4">
                                  {course.governmentExams.map((exam, i) => (
                                    <div key={i} className="flex gap-4 p-5 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border-l-4 border-[#e67e22]">
                                      <div className="flex-1">
                                        <p className="font-black text-[#1e293b] dark:text-white text-sm">{exam.examName}</p>
                                        <p className="text-xs text-gray-500 mt-1">{exam.description}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-8 rounded-[2rem] border-2 border-[#bae6fd] dark:border-blue-900/30">
                                <h4 className="text-xs font-black uppercase tracking-widest text-[#3498db] mb-4">Key Subjects</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  {course.subjects.map((sub, i) => (
                                    <div key={i} className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 bg-[#3498db] rounded-full"></span> {sub}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400 font-bold">No courses found matching your search or filters.</p>
                  <button 
                    onClick={() => {setSearchTerm(""); setFilters({stream: "", degree: ""});}}
                    className="mt-4 text-[#e67e22] font-black uppercase text-xs tracking-widest hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;