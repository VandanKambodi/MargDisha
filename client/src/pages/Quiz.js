import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../utils/quizUtils.js";
import { motion, AnimatePresence } from "framer-motion";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
    if (user && token) {
      checkSavedResults();
    }
  }, [user, token]);

  const checkSavedResults = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/stream-quiz/results", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const savedResults = await response.json();
        if (savedResults && savedResults.length > 0) {
          const latestResult = savedResults[0];
          setResults(latestResult.results);
        }
      }
    } catch (error) { console.log("Error loading results:", error); }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5000/api/stream-quiz/random";
      if (user && user._id) {
        url += `?userId=${user._id}`;
      } else {
        const usedQuestions = JSON.parse(localStorage.getItem("usedQuestions") || "[]");
        if (usedQuestions.length > 0) {
          const recentQuestions = usedQuestions.slice(-1800);
          localStorage.setItem("usedQuestions", JSON.stringify(recentQuestions));
          url += `?excludeIds=${encodeURIComponent(JSON.stringify(recentQuestions))}`;
        }
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();
      setQuestions(data.questions);
      setLoading(false);
    } catch (error) {
      setError("Failed to load quiz questions.");
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionValue) => {
    setSelectedOption(optionValue);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: questions[currentQuestion]._id,
      selectedOptionId: optionValue,
    };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        submitQuiz(newAnswers);
      }
    }, 500);
  };

  const submitQuiz = async (finalAnswers) => {
    const localResults = calculateResults(finalAnswers);
    if (!token) {
      setResults(localResults);
      setShowResults(true);
      return;
    }
    try {
      const submissionData = {
        answers: finalAnswers,
        results: localResults,
        completedAt: new Date().toISOString(),
        quizType: "career-assessment",
      };
      const response = await fetch("http://localhost:5000/api/stream-quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(submissionData),
      });
      if (response.ok) {
        localResults.savedToServer = true;
        localResults.saveMessage = "Results saved to your account!";
      }
      setResults(localResults);
      setShowResults(true);
    } catch (error) {
      setResults(localResults);
      setShowResults(true);
    }
  };

  const calculateResults = (finalAnswers) => {
    if (!user) {
      const questionIds = finalAnswers.map((answer) => answer.questionId);
      const usedQuestions = JSON.parse(localStorage.getItem("usedQuestions") || "[]");
      usedQuestions.push(...questionIds);
      localStorage.setItem("usedQuestions", JSON.stringify(usedQuestions.slice(-1800)));
    }
    const streamCorrectAnswers = { science: 0, commerce: 0, arts: 0, diploma: 0 };
    let totalCorrectAnswers = 0;
    finalAnswers.forEach((answer) => {
      const question = questions.find((q) => q._id === answer.questionId);
      if (question) {
        const opt = question.options.find((o) => o.value === answer.selectedOptionId);
        if (opt?.isCorrect) {
          streamCorrectAnswers[question.stream] += 1;
          totalCorrectAnswers += 1;
        }
      }
    });
    const streamPercentages = {};
    for (const [stream, count] of Object.entries(streamCorrectAnswers)) {
      streamPercentages[stream] = Math.round((count / 5) * 100);
    }
    const sortedStreams = Object.entries(streamPercentages).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const recommendations = sortedStreams.map(([stream, percentage]) => ({
      stream, percentage, correctCount: streamCorrectAnswers[stream], totalQuestions: 5,
    }));
    return {
      totalQuestions: questions.length,
      correctAnswers: totalCorrectAnswers,
      accuracy: Math.round((totalCorrectAnswers / questions.length) * 100),
      streamCorrectAnswers, streamPercentages, recommendations,
      userId: user?._id, completedAt: new Date().toISOString(),
    };
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowResults(false);
    setResults(null);
    fetchQuestions();
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}
            className="w-12 h-12 border-4 border-[#e67e22] border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#1e293b] dark:text-white">Analyzing Database...</h2>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="h-screen flex items-center justify-center px-4 bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="max-w-2xl w-full bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-black text-[#1e293b] dark:text-white mb-2">Stage 1 Complete!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">Knowledge assessment successfully analyzed.</p>
          
          <div className="bg-gradient-to-br from-[#1e4b6e] to-[#0f172a] p-6 rounded-3xl text-white mb-8">
            <h2 className="text-lg font-bold mb-2 text-[#bae6fd]">Next Step: Psychometric Test</h2>
            <p className="text-sm opacity-90 leading-relaxed">To provide accurate career suggestions, we need to analyze your personality traits.</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={() => navigate("/psychometric-test", { state: { quizResults: results } })}
              className="px-8 py-3 bg-[#e67e22] text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all">
              Begin Personality Test
            </button>
            <button onClick={restartQuiz} className="px-8 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-[#0f172a] transition-all">
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="h-screen flex items-center justify-center px-4 bg-[#f8fafc] dark:bg-[#0f172a] transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e67e22]/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3498db]/10 rounded-full blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative max-w-2xl w-full bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-700">
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-[#e67e22] text-[10px] font-black uppercase rounded-lg tracking-widest">Question {currentQuestion + 1}/{questions.length}</span>
            <h1 className="text-xl font-black text-[#1e293b] dark:text-white mt-2">Career Assessment</h1>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentQ.stream} Assessment</span>
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mb-8 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-[#e67e22] to-[#f39c12]"
            initial={{ width: 0 }} animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-lg md:text-xl font-bold text-[#1e293b] dark:text-white mb-6 leading-tight min-h-[3rem]">{currentQ.question}</h2>
            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((option, index) => (
                <button key={option.value} onClick={() => handleAnswerSelect(option.value)} disabled={selectedOption !== null}
                  className={`flex items-center p-4 rounded-2xl border-2 transition-all text-left font-bold text-sm
                    ${selectedOption === option.value ? "border-[#e67e22] bg-orange-50 dark:bg-orange-900/20 text-[#e67e22]" : "border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-[#3498db] dark:hover:border-[#3498db]"}`}>
                  <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4 text-xs font-black">{String.fromCharCode(65 + index)}</span>
                  {option.text}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-8">
          <button onClick={goToPrevious} disabled={currentQuestion === 0}
            className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#e67e22] disabled:opacity-0 transition-all">← Back</button>
          <span className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em]">MargDisha Intelligent Quiz Engine</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Quiz;