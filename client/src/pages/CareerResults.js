import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";

/* ─── Stream → Recommended Courses mapping ────────────────────────── */
const STREAM_COURSES = {
  science: [
    {
      name: "B.Tech Computer Science",
      code: "B.Tech CSE",
      stream: "engineering",
      icon: "💻",
      duration: "4 Years",
      salary: "₹6L – ₹25L",
      why: "Top pick for science + analytical minds",
    },
    {
      name: "B.Tech Electronics & Communication",
      code: "B.Tech ECE",
      stream: "engineering",
      icon: "📡",
      duration: "4 Years",
      salary: "₹5L – ₹20L",
      why: "Semiconductor & IoT industry demand",
    },
    {
      name: "MBBS",
      code: "MBBS",
      stream: "medical",
      icon: "🩺",
      duration: "5.5 Years",
      salary: "₹8L – ₹50L",
      why: "India's most prestigious medical degree",
    },
    {
      name: "B.Sc Computer Science",
      code: "B.Sc CS",
      stream: "science",
      icon: "🖥️",
      duration: "3 Years",
      salary: "₹3.5L – ₹10L",
      why: "Affordable IT career path",
    },
    {
      name: "B.Sc Biotechnology",
      code: "B.Sc Biotech",
      stream: "science",
      icon: "🧬",
      duration: "3 Years",
      salary: "₹3.5L – ₹12L",
      why: "Growing biotech & pharma sector",
    },
    {
      name: "Bachelor of Pharmacy",
      code: "B.Pharm",
      stream: "medical",
      icon: "💊",
      duration: "4 Years",
      salary: "₹3L – ₹12L",
      why: "India's booming pharma industry",
    },
    {
      name: "B.Tech Mechanical Engineering",
      code: "B.Tech ME",
      stream: "engineering",
      icon: "⚙️",
      duration: "4 Years",
      salary: "₹4L – ₹18L",
      why: "Core engineering with PSU opportunities",
    },
    {
      name: "B.Arch",
      code: "B.Arch",
      stream: "engineering",
      icon: "🏗️",
      duration: "5 Years",
      salary: "₹4L – ₹15L",
      why: "Smart Cities & infrastructure boom",
    },
  ],
  commerce: [
    {
      name: "B.Com (Honours)",
      code: "B.Com (Hons)",
      stream: "commerce",
      icon: "📊",
      duration: "3 Years",
      salary: "₹4L – ₹30L",
      why: "Gateway to CA, MBA & Investment Banking",
    },
    {
      name: "BBA",
      code: "BBA",
      stream: "management",
      icon: "💼",
      duration: "3 Years",
      salary: "₹3L – ₹9L",
      why: "Stepping stone to MBA from IIMs",
    },
    {
      name: "MBA",
      code: "MBA",
      stream: "management",
      icon: "🎯",
      duration: "2 Years",
      salary: "₹10L – ₹60L",
      why: "India's highest-demand management degree",
    },
    {
      name: "BA Economics",
      code: "BA Economics",
      stream: "arts",
      icon: "📈",
      duration: "3 Years",
      salary: "₹4L – ₹15L",
      why: "Banking, RBI & economic policy roles",
    },
    {
      name: "Bachelor of Hotel Management",
      code: "BHM",
      stream: "management",
      icon: "🏨",
      duration: "4 Years",
      salary: "₹4L – ₹20L",
      why: "Hospitality industry projected at $50B+",
    },
    {
      name: "Integrated BA LLB",
      code: "BA LLB",
      stream: "law",
      icon: "⚖️",
      duration: "5 Years",
      salary: "₹4L – ₹40L",
      why: "Corporate law pays premium salaries",
    },
  ],
  arts: [
    {
      name: "BA Psychology",
      code: "BA Psychology",
      stream: "arts",
      icon: "🧠",
      duration: "3 Years",
      salary: "₹3L – ₹15L",
      why: "Growing mental health demand in India",
    },
    {
      name: "BA Political Science",
      code: "BA PolSci",
      stream: "arts",
      icon: "🏛️",
      duration: "3 Years",
      salary: "₹4L – ₹20L",
      why: "#1 optional for UPSC Civil Services",
    },
    {
      name: "Bachelor of Design",
      code: "B.Des",
      stream: "arts",
      icon: "🎨",
      duration: "4 Years",
      salary: "₹4L – ₹20L",
      why: "UI/UX designers earn ₹20L+ at top firms",
    },
    {
      name: "BJMC",
      code: "BJMC",
      stream: "arts",
      icon: "📰",
      duration: "3 Years",
      salary: "₹3L – ₹10L",
      why: "Digital media boom — ₹2.3 lakh crore industry",
    },
    {
      name: "BA English Literature",
      code: "BA English",
      stream: "arts",
      icon: "📚",
      duration: "3 Years",
      salary: "₹2.5L – ₹10L",
      why: "Content, media & civil services",
    },
    {
      name: "LLB",
      code: "LLB",
      stream: "law",
      icon: "⚖️",
      duration: "3 Years",
      salary: "₹3L – ₹30L",
      why: "Corporate & litigation law careers",
    },
    {
      name: "B.Ed",
      code: "B.Ed",
      stream: "education",
      icon: "👩‍🏫",
      duration: "2 Years",
      salary: "₹4L – ₹15L",
      why: "Mandatory for teaching — KVS, NVS, CTET",
    },
  ],
  diploma: [
    {
      name: "BCA",
      code: "BCA",
      stream: "science",
      icon: "💻",
      duration: "3 Years",
      salary: "₹3.5L – ₹12L",
      why: "Affordable IT path — no JEE needed",
    },
    {
      name: "B.Tech Information Technology",
      code: "B.Tech IT",
      stream: "engineering",
      icon: "🌐",
      duration: "4 Years",
      salary: "₹5L – ₹20L",
      why: "Full-stack & cloud computing careers",
    },
    {
      name: "B.Sc Nursing",
      code: "B.Sc Nursing",
      stream: "medical",
      icon: "🏥",
      duration: "4 Years",
      salary: "₹3L – ₹50L",
      why: "International demand — UK, Gulf, Australia",
    },
    {
      name: "B.Sc Agriculture",
      code: "B.Sc Agri",
      stream: "science",
      icon: "🌾",
      duration: "4 Years",
      salary: "₹3L – ₹15L",
      why: "AgriTech & NABARD bank officer posts",
    },
    {
      name: "MCA",
      code: "MCA",
      stream: "science",
      icon: "🖥️",
      duration: "2 Years",
      salary: "₹6L – ₹25L",
      why: "Equivalent to M.Tech for BCA grads",
    },
    {
      name: "Bachelor of Hotel Management",
      code: "BHM",
      stream: "management",
      icon: "🏨",
      duration: "4 Years",
      salary: "₹4L – ₹20L",
      why: "Hospitality & event management",
    },
  ],
};

/* ─── Stream → College Types to search ────────────────────────────── */
const STREAM_COLLEGE_TYPES = {
  science: {
    label: "Engineering & Science Colleges",
    types: ["Engineering", "Medical", "Science", "Pharmacy"],
    icon: "🏛️",
  },
  commerce: {
    label: "Commerce & Management Colleges",
    types: ["Commerce", "Management", "Business School", "Law"],
    icon: "🏢",
  },
  arts: {
    label: "Arts, Design & Law Colleges",
    types: ["Arts", "Design", "Law", "Education", "Media"],
    icon: "🎭",
  },
  diploma: {
    label: "Polytechnic & Applied Colleges",
    types: ["Polytechnic", "IT", "Nursing", "Agriculture", "Hotel Management"],
    icon: "🎓",
  },
};

const CareerResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const { quizResults, psychometricResults } = location.state || {};
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimateBars(true), 300);
    window.scrollTo(0, 0);
  }, []);

  if (!quizResults || !psychometricResults) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a] px-4">
        <div className="bg-white dark:bg-[#1e293b] shadow-2xl rounded-[2.5rem] p-10 text-center border border-gray-100 dark:border-gray-800 max-w-md w-full">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-black text-[#1e293b] dark:text-white mb-4">
            Assessment Required
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
            Please complete both the Knowledge and Psychometric tests to view
            your results.
          </p>
          <button
            onClick={() => navigate("/quiz")}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  const { streamPercentages } = quizResults;
  const traits = psychometricResults.personalityTraits;

  /* ─── Career recommendations (existing logic, expanded) ──────────── */
  const generateCareerRecommendations = () => {
    const recommendations = [];

    if (streamPercentages.science > 25 && traits.analytical > 70) {
      recommendations.push({
        career: "Software Developer",
        match: Math.min(
          95,
          streamPercentages.science + traits.analytical * 0.3,
        ),
        category: "Technology",
        description:
          "Build modern applications and software systems using cutting-edge logic.",
        skills: ["Programming", "Logic", "Problem Solving"],
        education: "B.Tech / BCA / Computer Science",
        salary: "₹6L – ₹25L / year",
        growth: "Very High Demand",
        icon: "💻",
      });
    }
    if (streamPercentages.science > 25 && traits.analytical > 50) {
      recommendations.push({
        career: "Data Scientist",
        match: Math.min(
          93,
          streamPercentages.science * 0.8 + traits.analytical * 0.4,
        ),
        category: "AI & Analytics",
        description:
          "Extract insights from large datasets using ML and statistical methods.",
        skills: ["Python", "Statistics", "Machine Learning"],
        education: "B.Tech CSE / M.Sc Data Science",
        salary: "₹8L – ₹30L / year",
        growth: "Very High",
        icon: "📊",
      });
    }
    if (streamPercentages.science > 30) {
      recommendations.push({
        career: "Doctor / Medical Professional",
        match: Math.min(
          90,
          streamPercentages.science * 0.9 + (traits.empathy || 50) * 0.2,
        ),
        category: "Healthcare",
        description:
          "Diagnose, treat and care for patients across medical specialties.",
        skills: ["Clinical Knowledge", "Patient Care", "Diagnosis"],
        education: "MBBS / BDS / B.Pharm",
        salary: "₹8L – ₹50L / year",
        growth: "Always in Demand",
        icon: "🩺",
      });
    }

    if (streamPercentages.commerce > 25 && traits.leadership > 70) {
      recommendations.push({
        career: "Business Manager",
        match: Math.min(
          95,
          streamPercentages.commerce + traits.leadership * 0.3,
        ),
        category: "Management",
        description:
          "Lead business teams and manage complex operations and strategies.",
        skills: ["Leadership", "Strategy", "Management"],
        education: "BBA / MBA",
        salary: "₹5L – ₹30L / year",
        growth: "Excellent",
        icon: "💼",
      });
    }
    if (streamPercentages.commerce > 25) {
      recommendations.push({
        career: "Chartered Accountant",
        match: Math.min(
          92,
          streamPercentages.commerce * 0.9 + (traits.analytical || 50) * 0.2,
        ),
        category: "Finance & Accounting",
        description:
          "Provide accounting, auditing and financial advisory services.",
        skills: ["Accounting", "Taxation", "Auditing"],
        education: "B.Com + CA",
        salary: "₹7L – ₹25L / year",
        growth: "High Demand",
        icon: "📋",
      });
    }
    if (
      streamPercentages.commerce > 20 &&
      (traits.leadership > 50 || traits.analytical > 50)
    ) {
      recommendations.push({
        career: "Investment Banker",
        match: Math.min(
          90,
          streamPercentages.commerce * 0.7 + traits.leadership * 0.3,
        ),
        category: "Banking & Finance",
        description:
          "Advise companies on mergers, acquisitions and capital raising.",
        skills: ["Financial Modelling", "Valuation", "Strategy"],
        education: "B.Com (Hons) / MBA Finance",
        salary: "₹10L – ₹60L / year",
        growth: "Premium Career",
        icon: "🏦",
      });
    }

    if (streamPercentages.arts > 25 && traits.creativity > 70) {
      recommendations.push({
        career: "UX Designer",
        match: Math.min(95, streamPercentages.arts + traits.creativity * 0.3),
        category: "Design",
        description:
          "Design intuitive user experiences and interfaces for modern digital products.",
        skills: ["Creativity", "Design Thinking", "Figma"],
        education: "B.Des / Design Certification",
        salary: "₹5L – ₹20L / year",
        growth: "Very High",
        icon: "🎨",
      });
    }
    if (streamPercentages.arts > 25) {
      recommendations.push({
        career: "Civil Servant (IAS/IPS)",
        match: Math.min(
          88,
          streamPercentages.arts * 0.8 + (traits.leadership || 50) * 0.3,
        ),
        category: "Government",
        description:
          "Serve in India's top administrative positions across states and centre.",
        skills: ["Current Affairs", "Writing", "Leadership"],
        education: "BA Political Science / Any Graduate",
        salary: "₹8L – ₹20L / year",
        growth: "Prestigious",
        icon: "🏛️",
      });
    }
    if (streamPercentages.arts > 20 && traits.creativity > 50) {
      recommendations.push({
        career: "Journalist / Content Creator",
        match: Math.min(
          87,
          streamPercentages.arts * 0.7 + traits.creativity * 0.3,
        ),
        category: "Media & Digital",
        description:
          "Create content, report news and build audience across digital platforms.",
        skills: ["Writing", "Storytelling", "Video Editing"],
        education: "BJMC / BA English",
        salary: "₹3L – ₹15L / year",
        growth: "Digital Boom",
        icon: "📰",
      });
    }

    if (streamPercentages.diploma > 25) {
      recommendations.push({
        career: "Full-Stack Developer",
        match: Math.min(
          90,
          streamPercentages.diploma * 0.8 + (traits.analytical || 50) * 0.3,
        ),
        category: "IT & Software",
        description:
          "Build end-to-end web and mobile applications with modern tech stacks.",
        skills: ["React", "Node.js", "Databases"],
        education: "BCA / MCA / B.Tech IT",
        salary: "₹5L – ₹20L / year",
        growth: "Very High Demand",
        icon: "🌐",
      });
    }

    return recommendations.sort((a, b) => b.match - a.match).slice(0, 5);
  };

  /* ─── Get recommended courses based on top streams ───────────────── */
  const getRecommendedCourses = () => {
    const sorted = Object.entries(streamPercentages).sort(
      (a, b) => b[1] - a[1],
    );
    const courses = [];
    const seen = new Set();
    sorted.forEach(([stream]) => {
      const streamCourses = STREAM_COURSES[stream] || [];
      streamCourses.forEach((c) => {
        if (!seen.has(c.code)) {
          seen.add(c.code);
          courses.push({ ...c, fromStream: stream });
        }
      });
    });
    return courses.slice(0, 8);
  };

  /* ─── Get recommended college types ──────────────────────────────── */
  const getRecommendedCollegeInfo = () => {
    const sorted = Object.entries(streamPercentages).sort(
      (a, b) => b[1] - a[1],
    );
    return sorted.slice(0, 3).map(([stream, pct]) => ({
      stream,
      percentage: pct,
      ...(STREAM_COLLEGE_TYPES[stream] || {
        label: stream,
        types: [],
        icon: "🏫",
      }),
    }));
  };

  const careerRecommendations = generateCareerRecommendations();
  const recommendedCourses = getRecommendedCourses();
  const recommendedColleges = getRecommendedCollegeInfo();
  const topStrengths = Object.entries(psychometricResults.personalityTraits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-all duration-500 relative overflow-hidden pb-20">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3498db]/5 dark:bg-[#3498db]/10 rounded-full blur-[120px] -z-0"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#e67e22]/5 dark:bg-[#e67e22]/5 rounded-full blur-[120px] -z-0"></div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#e67e22] to-[#f39c12] flex items-center justify-center shadow-xl shadow-orange-500/20 ring-4 ring-white dark:ring-[#1e293b]">
            <span className="text-white text-3xl font-black">✓</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#1e293b] dark:text-white tracking-tight">
            Career <span className="text-[#e67e22]">Analysis</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            We've synchronized your academic aptitude with your personality
            traits to map your ideal future.
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* LEFT: CAREER CARDS */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#3498db] flex items-center gap-3">
              <span className="w-12 h-[2px] bg-[#3498db]"></span> Top Career
              Matches
            </h2>

            {careerRecommendations.map((career, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="group bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-transparent hover:border-[#bae6fd]/50 overflow-hidden relative"
              >
                {/* Match Percentage Circle */}
                <div className="absolute top-0 right-0 p-8">
                  <div className="text-right">
                    <div className="text-4xl font-black text-[#e67e22]">
                      {Math.round(career.match)}%
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Match Score
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-6 mb-8 pr-28">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-[#0f172a] rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:rotate-12 transition-transform duration-500 flex-shrink-0">
                    {career.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl sm:text-3xl font-black text-[#1e293b] dark:text-white leading-tight break-words">
                      {career.career}
                    </h3>
                    <p className="text-[#3498db] font-bold uppercase text-xs tracking-widest mt-1">
                      {career.category}
                    </p>
                  </div>
                </div>

                {/* Animated Match Bar */}
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-8 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: animateBars ? `${career.match}%` : "0%" }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-[#1e4b6e] via-[#3498db] to-[#bae6fd]"
                  />
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium leading-relaxed italic">
                  "{career.description}"
                </p>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {career.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl bg-[#bae6fd] dark:bg-blue-900/30 text-[#1e4b6e] dark:text-[#bae6fd] border border-[#3498db]/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Stats Table */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-dashed border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Education
                    </p>
                    <p className="text-xs font-bold text-[#1e293b] dark:text-white">
                      {career.education}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Salary Range
                    </p>
                    <p className="text-xs font-bold text-[#e67e22]">
                      {career.salary}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Outlook
                    </p>
                    <p className="text-xs font-bold text-green-500">
                      {career.growth}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* RIGHT: STRENGTHS & ACTIONS */}
          <div className="space-y-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#e67e22] flex items-center gap-3">
              <span className="w-12 h-[2px] bg-[#e67e22]"></span> Personality
              Core
            </h2>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#1e293b] p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group"
            >
              <div className="absolute -right-10 -top-10 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">
                🧠
              </div>
              <h3 className="text-xl font-black mb-8 relative z-10">
                Top Strengths
              </h3>

              <div className="space-y-8 relative z-10">
                {topStrengths.map(([trait, score], index) => (
                  <div key={index}>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-xs font-black uppercase tracking-widest text-blue-200">
                        {trait.replace("_", " ")}
                      </span>
                      <span className="text-xl font-black text-[#e67e22]">
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: animateBars ? `${score}%` : "0%" }}
                        transition={{ duration: 1.5, delay: index * 0.1 }}
                        className="h-full bg-[#e67e22]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate("/courses")}
                className="w-full py-5 rounded-[2rem] bg-[#e67e22] text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all"
              >
                Explore All Courses →
              </button>
              <button
                onClick={() => navigate("/colleges")}
                className="w-full py-5 rounded-[2rem] border-2 border-gray-200 dark:border-gray-700 text-[#1e293b] dark:text-white font-black uppercase tracking-widest text-xs hover:bg-white dark:hover:bg-[#1e293b] transition-all"
              >
                Find All Colleges
              </button>
              <button
                onClick={() => navigate("/quiz")}
                className="w-full py-4 text-gray-400 font-bold text-xs hover:text-[#e67e22] transition-colors"
              >
                Retake Assessment
              </button>
            </div>

            {/* Account Storage Note */}
            <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 text-center">
              {user ? (
                <p className="text-[10px] font-bold text-[#1e4b6e] dark:text-blue-300 leading-relaxed uppercase tracking-wider">
                  🛡️ These results are securely backed up to your account.
                </p>
              ) : (
                <p className="text-[10px] font-bold text-orange-600 leading-relaxed uppercase tracking-wider">
                  ⚠️ results saved locally. Sign up to sync permanently.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ─── RECOMMENDED COURSES SECTION ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#e67e22] flex items-center gap-3 mb-8">
            <span className="w-12 h-[2px] bg-[#e67e22]"></span> Recommended
            Courses For You
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendedCourses.map((course, index) => (
              <motion.div
                key={course.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.08 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative bg-white dark:bg-[#1e293b] rounded-[2rem] p-6 shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-800 hover:border-[#3498db]/30 transition-all cursor-pointer overflow-hidden"
                onClick={() => navigate(`/courses?stream=${course.stream}`)}
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#3498db]/0 to-[#e67e22]/0 group-hover:from-[#3498db]/5 group-hover:to-[#e67e22]/5 transition-all duration-500 rounded-[2rem]" />

                <div className="relative z-10">
                  <span className="text-3xl block mb-3">{course.icon}</span>
                  <h3 className="text-sm font-black text-[#1e293b] dark:text-white leading-tight mb-1 group-hover:text-[#e67e22] transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-[9px] font-black text-[#3498db] uppercase tracking-widest mb-3">
                    {course.code}
                  </p>

                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed mb-4 italic">
                    "{course.why}"
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      {course.duration}
                    </span>
                    <span className="text-[9px] font-black text-[#e67e22]">
                      {course.salary}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-dashed border-gray-100 dark:border-gray-700">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#3498db] group-hover:text-[#e67e22] transition-colors">
                      View Course Details →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Browse all courses link */}
          <div className="text-center mt-8">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all"
            >
              Browse All 35+ Courses →
            </Link>
          </div>
        </motion.div>

        {/* ─── RECOMMENDED COLLEGES SECTION ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#3498db] flex items-center gap-3 mb-8">
            <span className="w-12 h-[2px] bg-[#3498db]"></span> Recommended
            College Types
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {recommendedColleges.map((col, index) => (
              <motion.div
                key={col.stream}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.15 }}
                whileHover={{ y: -6 }}
                className="group relative bg-gradient-to-br from-[#1e4b6e] to-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden cursor-pointer"
                onClick={() => navigate("/colleges")}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity duration-500">
                  <span className="text-7xl">{col.icon}</span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1.5 bg-white/10 backdrop-blur rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-200">
                      {col.stream} stream
                    </span>
                    <span className="text-2xl font-black text-[#e67e22]">
                      {col.percentage}%
                    </span>
                  </div>

                  <h3 className="text-lg font-black leading-tight mb-4 group-hover:text-[#e67e22] transition-colors">
                    {col.label}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {col.types.map((type, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-bold text-blue-100"
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-blue-300 group-hover:text-[#e67e22] transition-colors">
                      Browse {col.label} →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Browse all colleges link */}
          <div className="text-center mt-8">
            <Link
              to="/colleges"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-[#1e293b] dark:text-white font-black text-xs uppercase tracking-widest hover:border-[#3498db] hover:text-[#3498db] hover:-translate-y-1 transition-all"
            >
              Search All India Colleges →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CareerResults;
