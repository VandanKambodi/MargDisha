import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const PsychometricTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const quizResults = location.state?.quizResults;

  const questions = [
    { id: 1, question: "I enjoy exploring new ideas and concepts, even if they seem unconventional.", trait: "openness", scale: "agree" },
    { id: 2, question: "I prefer practical, proven methods over experimental approaches.", trait: "openness", scale: "disagree" },
    { id: 3, question: "I always complete my assignments on time and follow through on commitments.", trait: "conscientiousness", scale: "agree" },
    { id: 4, question: "I often procrastinate and struggle with time management.", trait: "conscientiousness", scale: "disagree" },
    { id: 5, question: "I feel energized when working in groups and collaborating with others.", trait: "extraversion", scale: "agree" },
    { id: 6, question: "I prefer working alone and find large groups draining.", trait: "extraversion", scale: "disagree" },
    { id: 7, question: "I enjoy solving complex mathematical or logical problems.", trait: "analytical", scale: "agree" },
    { id: 8, question: "I prefer creative tasks over analytical problem-solving.", trait: "analytical", scale: "disagree" },
    { id: 9, question: "I naturally take charge in group situations and enjoy leading others.", trait: "leadership", scale: "agree" },
    { id: 10, question: "I prefer to follow others' lead rather than take responsibility for decisions.", trait: "leadership", scale: "disagree" },
    { id: 11, question: "I often come up with original ideas and enjoy artistic expression.", trait: "creativity", scale: "agree" },
    { id: 12, question: "I prefer structured tasks with clear guidelines over open-ended creative work.", trait: "creativity", scale: "disagree" },
    { id: 13, question: "I am passionate about helping others and making a positive social impact.", trait: "social", scale: "agree" },
    { id: 14, question: "I am more interested in technical achievements than helping people.", trait: "social", scale: "disagree" },
    { id: 15, question: "I am comfortable taking calculated risks for potential rewards.", trait: "risk_tolerance", scale: "agree" },
    { id: 16, question: "I prefer safe, predictable choices over uncertain opportunities.", trait: "risk_tolerance", scale: "disagree" },
    { id: 17, question: "I pay close attention to details and rarely make careless mistakes.", trait: "detail_oriented", scale: "agree" },
    { id: 18, question: "I focus on the big picture and sometimes overlook small details.", trait: "detail_oriented", scale: "disagree" },
    { id: 19, question: "I excel at explaining complex ideas clearly to others.", trait: "communication", scale: "agree" },
    { id: 20, question: "I find it challenging to express my thoughts verbally or in writing.", trait: "communication", scale: "disagree" },
  ];

  const options = [
    { value: 1, text: "Strongly Disagree" },
    { value: 2, text: "Disagree" },
    { value: 3, text: "Neutral" },
    { value: 4, text: "Agree" },
    { value: 5, text: "Strongly Agree" },
  ];

  const handleAnswerSelect = (value) => {
    setSelectedOption(value);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: questions[currentQuestion].id,
      trait: questions[currentQuestion].trait,
      scale: questions[currentQuestion].scale,
      value: value,
    };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        calculateResults(newAnswers);
      }
    }, 500);
  };

  const calculateResults = (finalAnswers) => {
    const traitScores = { openness: 0, conscientiousness: 0, extraversion: 0, analytical: 0, leadership: 0, creativity: 0, social: 0, risk_tolerance: 0, detail_oriented: 0, communication: 0 };
    finalAnswers.forEach((ans) => {
      let score = ans.value;
      if (ans.scale === "disagree") score = 6 - score;
      traitScores[ans.trait] += score;
    });
    const enhancedScores = {};
    Object.keys(traitScores).forEach((trait, index) => {
      let baseScore = (traitScores[trait] / 10) * 100;
      enhancedScores[trait] = Math.round(baseScore + (index * 0.1));
    });
    navigate("/career-results", { state: { quizResults, psychometricResults: { personalityTraits: enhancedScores, answers: finalAnswers, rawScores: traitScores } } });
  };

  if (!quizResults) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[2rem] shadow-2xl text-center border dark:border-gray-800">
          <h2 className="text-xl font-black text-[#1e293b] dark:text-white mb-2">Unauthorized Access</h2>
          <p className="text-gray-500 mb-6">Complete the Knowledge Quiz first.</p>
          <button onClick={() => navigate("/quiz")} className="px-8 py-3 bg-[#3498db] text-white font-bold rounded-xl">Go to Quiz</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center px-4 bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3498db]/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#e67e22]/10 rounded-full blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative max-w-2xl w-full bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-700">
        
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-[#3498db] text-[9px] font-black uppercase rounded-lg tracking-widest">Assessment {currentQuestion + 1}/20</span>
            <h1 className="text-xl font-black text-[#1e293b] dark:text-white mt-1">Personality Mapping</h1>
          </div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Trait: {questions[currentQuestion].trait}</span>
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mb-6 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-[#3498db] to-[#bae6fd]"
            initial={{ width: 0 }} animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-lg font-bold text-[#1e293b] dark:text-white mb-6 leading-tight min-h-[3rem] text-center md:text-left">{questions[currentQuestion].question}</h2>
            <div className="grid grid-cols-1 gap-2 md:gap-3">
              {options.map((option) => (
                <button key={option.value} onClick={() => handleAnswerSelect(option.value)} disabled={selectedOption !== null}
                  className={`flex items-center p-3 rounded-2xl border-2 transition-all font-bold text-xs md:text-sm
                    ${selectedOption === option.value ? "border-[#3498db] bg-blue-50 dark:bg-blue-900/20 text-[#3498db]" : "border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-[#e67e22]"}`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-xs font-black transition-colors ${selectedOption === option.value ? "bg-[#3498db] text-white" : "bg-gray-100 dark:bg-gray-800"}`}>{option.value}</span>
                  {option.text}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-6">
          <button onClick={() => currentQuestion > 0 && setCurrentQuestion(c => c - 1)} disabled={currentQuestion === 0}
            className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#3498db] disabled:opacity-0 transition-all">← Previous</button>
          <span className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">Psychometric AI Core</span>
        </div>
      </motion.div>
    </div>
  );
};

export default PsychometricTest;