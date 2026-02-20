import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";

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
          <h2 className="text-2xl font-black text-[#1e293b] dark:text-white mb-4">Assessment Required</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Please complete both the Knowledge and Psychometric tests to view your results.</p>
          <button onClick={() => navigate("/quiz")} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  const generateCareerRecommendations = () => {
    const recommendations = [];
    const { streamPercentages } = quizResults;
    const traits = psychometricResults.personalityTraits;

    if (streamPercentages.science > 25 && traits.analytical > 70) {
      recommendations.push({
        career: "Software Developer",
        match: Math.min(95, streamPercentages.science + traits.analytical * 0.3),
        category: "Technology",
        description: "Build modern applications and software systems using cutting-edge logic.",
        skills: ["Programming", "Logic", "Problem Solving"],
        education: "B.Tech / BCA / Computer Science",
        salary: "₹6L – ₹25L / year",
        growth: "Very High Demand",
        icon: "💻"
      });
    }

    if (streamPercentages.commerce > 25 && traits.leadership > 70) {
      recommendations.push({
        career: "Business Manager",
        match: Math.min(95, streamPercentages.commerce + traits.leadership * 0.3),
        category: "Management",
        description: "Lead business teams and manage complex operations and strategies.",
        skills: ["Leadership", "Strategy", "Management"],
        education: "BBA / MBA",
        salary: "₹5L – ₹30L / year",
        growth: "Excellent",
        icon: "📊"
      });
    }

    if (streamPercentages.arts > 25 && traits.creativity > 70) {
      recommendations.push({
        career: "UX Designer",
        match: Math.min(95, streamPercentages.arts + traits.creativity * 0.3),
        category: "Design",
        description: "Design intuitive user experiences and interfaces for modern digital products.",
        skills: ["Creativity", "Design Thinking"],
        education: "Design Degree / Certification",
        salary: "₹5L – ₹20L / year",
        growth: "Very High",
        icon: "🎨"
      });
    }

    return recommendations.sort((a, b) => b.match - a.match);
  };

  const careerRecommendations = generateCareerRecommendations();
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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#e67e22] to-[#f39c12] flex items-center justify-center shadow-xl shadow-orange-500/20 ring-4 ring-white dark:ring-[#1e293b]">
            <span className="text-white text-3xl font-black">✓</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#1e293b] dark:text-white tracking-tight">
            Career <span className="text-[#e67e22]">Analysis</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            We've synchronized your academic aptitude with your personality traits to map your ideal future.
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* LEFT: CAREER CARDS */}
          <div className="lg:col-span-2 space-y-8">
             <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#3498db] flex items-center gap-3">
               <span className="w-12 h-[2px] bg-[#3498db]"></span> Top Career Matches
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
                        <div className="text-4xl font-black text-[#e67e22]">{Math.round(career.match)}%</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Match Score</div>
                    </div>
                </div>

                <div className="flex items-start gap-6 mb-8">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-[#0f172a] rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:rotate-12 transition-transform duration-500">
                        {career.icon}
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-[#1e293b] dark:text-white leading-tight">
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
                    <span key={i} className="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl bg-[#bae6fd] dark:bg-blue-900/30 text-[#1e4b6e] dark:text-[#bae6fd] border border-[#3498db]/20">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Stats Table */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-dashed border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Education</p>
                    <p className="text-xs font-bold text-[#1e293b] dark:text-white">{career.education}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Salary Range</p>
                    <p className="text-xs font-bold text-[#e67e22]">{career.salary}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Outlook</p>
                    <p className="text-xs font-bold text-green-500">{career.growth}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* RIGHT: STRENGTHS & ACTIONS */}
          <div className="space-y-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#e67e22] flex items-center gap-3">
               <span className="w-12 h-[2px] bg-[#e67e22]"></span> Personality Core
            </h2>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} 
                className="bg-[#1e293b] p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
               <div className="absolute -right-10 -top-10 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">🧠</div>
               <h3 className="text-xl font-black mb-8 relative z-10">Top Strengths</h3>
               
               <div className="space-y-8 relative z-10">
                {topStrengths.map(([trait, score], index) => (
                  <div key={index}>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-xs font-black uppercase tracking-widest text-blue-200">
                        {trait.replace("_", " ")}
                      </span>
                      <span className="text-xl font-black text-[#e67e22]">{score}%</span>
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
              <button onClick={() => navigate("/courses")} 
                className="w-full py-5 rounded-[2rem] bg-[#e67e22] text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all">
                Explore Courses →
              </button>
              <button onClick={() => navigate("/colleges")} 
                className="w-full py-5 rounded-[2rem] border-2 border-gray-200 dark:border-gray-700 text-[#1e293b] dark:text-white font-black uppercase tracking-widest text-xs hover:bg-white dark:hover:bg-[#1e293b] transition-all">
                Find Colleges
              </button>
              <button onClick={() => navigate("/quiz")} 
                className="w-full py-4 text-gray-400 font-bold text-xs hover:text-[#e67e22] transition-colors">
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
      </div>
    </div>
  );
};

export default CareerResults;