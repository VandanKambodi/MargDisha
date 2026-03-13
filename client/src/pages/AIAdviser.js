import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const API = "http://localhost:5000/api/ai-adviser";

const AIAdviser = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profileComplete, setProfileComplete] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  const getFormattedTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    checkProfileCompletion();
    loadLocalHistory();
  }, []);

  useEffect(() => {
    if (profileComplete && messages.length === 0) {
      handleSendMessage("hello");
    }
  }, [profileComplete]);

  const loadLocalHistory = () => {
    const saved = JSON.parse(
      localStorage.getItem("margdisha_ai_history") || "[]",
    );
    setChatHistory(saved);
  };

  const startNewChat = () => {
    if (messages.length > 1) {
      const newId = Date.now();
      const title =
        messages.find((m) => m.type === "user")?.content?.substring(0, 30) ||
        "New Session";
      const newHistory = [
        { id: newId, title: `${title}...`, data: messages },
        ...chatHistory,
      ];
      setChatHistory(newHistory);
      localStorage.setItem("margdisha_ai_history", JSON.stringify(newHistory));
    }
    setMessages([]);
  };

  const deleteHistoryItem = (e, id) => {
    e.stopPropagation();
    const filtered = chatHistory.filter((item) => item.id !== id);
    setChatHistory(filtered);
    localStorage.setItem("margdisha_ai_history", JSON.stringify(filtered));
  };

  const checkProfileCompletion = async () => {
    try {
      setLoadingProfile(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/profile-check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileComplete(response.data.success);
    } catch (err) {
      console.error("Profile check failed", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSendMessage = async (msgToSend = null) => {
    const messageText = msgToSend || inputValue.trim();
    if (!messageText) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: messageText,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/chat`,
        { message: messageText },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          content: response.data.response,
          timestamp: getFormattedTime(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      setError("AI Service connection lost.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile)
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-10 h-10 border-4 border-[#e67e22] border-t-transparent rounded-full"
        />
      </div>
    );

  if (!profileComplete)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 px-6">
        <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-10 text-center">
          <div className="text-5xl mb-6">⚠️</div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Profile Setup Required
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mt-3 mb-6 text-sm">
            Please complete your profile to access the AI Adviser and other
            features.
          </p>

          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 transition rounded-xl text-white font-semibold"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );

  return (
    <div className="h-screen flex bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden transition-all duration-500">
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-[#0f172a] shrink-0 z-20 shadow-xl shadow-gray-200/50 dark:shadow-none">
        <div className="p-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startNewChat}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#e67e22] to-[#f39c12] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
          >
            <span>+</span> New Consultation
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-3 custom-scrollbar">
          <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
            History
          </p>
          {chatHistory.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setMessages(item.data)}
              className="group flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-[#bae6fd]/30 dark:hover:bg-blue-900/20 cursor-pointer border border-transparent hover:border-[#3498db]/30 transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-sm">📝</span>
                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 truncate leading-tight">
                  {item.title}
                </span>
              </div>
              <button
                onClick={(e) => deleteHistoryItem(e, item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-all"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1e293b] rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e4b6e] to-[#3498db] flex items-center justify-center text-white font-black text-sm shadow-md">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-[#1e293b] dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest">
                Active Now
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col relative bg-white dark:bg-[#1e293b] z-10">
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-10 custom-scrollbar">
          <div className="flex justify-center">
            <span className="px-4 py-1.5 rounded-full bg-gray-100/80 dark:bg-[#0f172a]/80 backdrop-blur-sm text-[10px] font-black uppercase text-gray-400 tracking-widest border border-gray-200 dark:border-gray-800">
              Session Live
            </span>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${message.type === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`relative max-w-[85%] md:max-w-[75%] p-7 rounded-[2.5rem] shadow-sm transition-all duration-300 ${message.type === "user" ? "bg-[#1e4b6e] text-white rounded-tr-none shadow-blue-900/10" : "bg-[#f1f5f9] dark:bg-[#0f172a] text-[#1e293b] dark:text-white border border-gray-100 dark:border-gray-800 rounded-tl-none"}`}
                >
                  {message.type === "bot" && (
                    <div className="flex items-center gap-2 mb-4 text-[#3498db]">
                      <div className="w-2 h-2 rounded-full bg-[#3498db] animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Neural Intelligence
                      </span>
                    </div>
                  )}
                  <div
                    className={`text-sm md:text-base leading-relaxed ${message.type === "user" ? "text-white" : ""}`}
                  >
                    <MarkdownRenderer
                      text={
                        message.type === "user"
                          ? message.content
                          : message.content.text
                      }
                      isUser={message.type === "user"}
                      onSuggestionClick={handleSendMessage}
                    />
                  </div>
                  {message.type === "bot" &&
                    message.content.suggestions?.length > 0 && (
                      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-2">
                        {message.content.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(s)}
                            className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-[11px] font-black text-[#1e4b6e] dark:text-blue-300 hover:border-[#3498db] hover:shadow-md transition-all uppercase tracking-tight"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
                <span className="mt-2 px-3 text-[9px] font-black uppercase text-gray-400 tracking-widest opacity-60">
                  {message.timestamp}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex flex-col items-start gap-2">
              <div className="bg-[#f1f5f9] dark:bg-[#0f172a] p-6 rounded-[2rem] rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-2 bg-[#3498db] rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                    className="w-2 h-2 bg-[#3498db] rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                    className="w-2 h-2 bg-[#3498db] rounded-full"
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BOX */}
        <footer className="p-6 md:p-10 shrink-0 bg-white/50 dark:bg-[#1e293b]/50 backdrop-blur-md border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 rounded-[2.5rem] p-2 pl-8 focus-within:ring-2 focus-within:ring-[#3498db] transition-all shadow-2xl"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your academic path..."
                disabled={loading}
                className="flex-1 bg-transparent py-5 text-sm md:text-base font-bold outline-none dark:text-white placeholder-gray-400"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                disabled={loading || !inputValue.trim()}
                className="w-14 h-14 bg-gradient-to-br from-[#e67e22] to-[#f39c12] text-white rounded-full flex items-center justify-center shadow-xl shadow-orange-500/30 disabled:opacity-30 transition-all shrink-0 ml-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-7 h-7 rotate-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </motion.button>
            </form>
            <div className="mt-4 flex justify-center gap-10 text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] opacity-40">
              <span>Official Guidance</span>
              <span>Real-time Data</span>
              <span>Privacy Guard</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

const MarkdownRenderer = ({ text, isUser, onSuggestionClick }) => {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];

  lines.forEach((line, idx) => {
    let processedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    if (processedLine.startsWith("### ")) {
      elements.push(
        <h3
          key={idx}
          className="text-sm font-black text-[#1e4b6e] dark:text-blue-300 mt-6 mb-3 uppercase tracking-widest"
        >
          {processedLine.substring(4)}
        </h3>,
      );
    } else if (processedLine.startsWith("## ")) {
      elements.push(
        <h2
          key={idx}
          className="text-base font-black text-[#1e293b] dark:text-white mt-8 mb-4 border-b-2 border-[#e67e22]/10 pb-2 leading-tight"
        >
          {processedLine.substring(3)}
        </h2>,
      );
    } else if (processedLine.match(/^[\s]*[-•✓✅]\s/)) {
      elements.push(
        <li
          key={idx}
          className="ml-5 list-none relative before:content-[''] before:absolute before:left-[-1.25rem] before:top-2 before:w-1.5 before:h-1.5 before:bg-[#e67e22] before:rounded-full mb-3 text-gray-700 dark:text-gray-300 font-medium"
        >
          {processedLine.replace(/^[\s]*[-•✓✅]\s/, "")}
        </li>,
      );
    } else if (processedLine.trim()) {
      elements.push(
        <p
          key={idx}
          className={`mb-4 font-semibold leading-relaxed ${isUser ? "text-white" : "text-gray-600 dark:text-gray-300"}`}
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />,
      );
    }
  });
  return <div>{elements}</div>;
};

export default AIAdviser;
