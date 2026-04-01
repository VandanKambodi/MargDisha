import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API = "http://localhost:5000/api/career-chatbot";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Show welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          type: "bot",
          content:
            "👋 Hi! I'm your **MargDisha Career Adviser**.\n\nI can help you with:\n- 🎓 Course & college recommendations\n- 💼 Career path guidance\n- 📝 Resume & interview tips\n- 📊 Job market insights\n- 🏆 Entrance exams info\n\nAsk me anything career-related!",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = inputValue.trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now(),
      type: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: text,
        sessionId: sessionId,
      });

      if (response.data.success) {
        if (response.data.sessionId) {
          setSessionId(response.data.sessionId);
        }

        const botMsg = {
          id: Date.now() + 1,
          type: "bot",
          content: response.data.reply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const errorMsg = {
          id: Date.now() + 1,
          type: "bot",
          content:
            response.data.message ||
            "Sorry, something went wrong. Please try again.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "⚠️ Unable to connect to the AI service. Please check if the server is running and try again.";
      const errorMsg = {
        id: Date.now() + 1,
        type: "bot",
        content: message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (text) => {
    setInputValue(text);
    setTimeout(() => {
      setInputValue(text);
      const fakeEvent = { preventDefault: () => {} };
      // We need to set input value first, then trigger send
    }, 0);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    // Trigger welcome message again
    setMessages([
      {
        id: "welcome",
        type: "bot",
        content:
          "👋 Hi! I'm your **MargDisha Career Adviser**.\n\nI can help you with:\n- 🎓 Course & college recommendations\n- 💼 Career path guidance\n- 📝 Resume & interview tips\n- 📊 Job market insights\n- 🏆 Entrance exams info\n\nAsk me anything career-related!",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const quickActions = [
    "Best career after 12th Science?",
    "Top engineering colleges in India",
    "How to prepare for UPSC?",
    "Skills for IT jobs",
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        id="chatbot-toggle-btn"
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center cursor-pointer border-0 outline-none"
        style={{
          background: "linear-gradient(135deg, #e67e22 0%, #f39c12 50%, #e74c3c 100%)",
          boxShadow: "0 8px 32px rgba(230, 126, 34, 0.45), 0 0 0 0 rgba(230, 126, 34, 0.3)",
        }}
        whileHover={{ scale: 1.1, boxShadow: "0 12px 40px rgba(230, 126, 34, 0.55)" }}
        whileTap={{ scale: 0.9 }}
        animate={
          !isOpen && hasUnread
            ? { scale: [1, 1.15, 1], boxShadow: ["0 8px 32px rgba(230, 126, 34, 0.45)", "0 12px 48px rgba(230, 126, 34, 0.7)", "0 8px 32px rgba(230, 126, 34, 0.45)"] }
            : {}
        }
        transition={!isOpen && hasUnread ? { repeat: Infinity, duration: 2 } : { duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Pulse ring animation */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-orange-400"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-[100px] right-6 z-[9998] w-[400px] max-w-[calc(100vw-32px)] flex flex-col rounded-3xl overflow-hidden"
            style={{
              height: "min(600px, calc(100vh - 140px))",
              boxShadow: "0 25px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            {/* Header */}
            <div
              className="shrink-0 px-5 py-4 flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, #1e4b6e 0%, #2c3e50 50%, #1a3550 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{
                      background: "linear-gradient(135deg, #e67e22, #f39c12)",
                      boxShadow: "0 4px 12px rgba(230, 126, 34, 0.4)",
                    }}
                  >
                    🎯
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#1e4b6e]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide">
                    Career Adviser
                  </h3>
                  <p className="text-green-300 text-[10px] font-semibold tracking-widest uppercase">
                    ● Online — Powered by Groq
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  title="New Chat"
                >
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={handleToggle}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  title="Close"
                >
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
              style={{
                background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
              }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] relative ${
                      msg.type === "user"
                        ? "order-1"
                        : "order-2"
                    }`}
                  >
                    {msg.type === "bot" && (
                      <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px]"
                          style={{ background: "linear-gradient(135deg, #e67e22, #f39c12)" }}
                        >
                          🎯
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Career Adviser
                        </span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.type === "user"
                          ? "rounded-br-md text-white"
                          : "rounded-bl-md text-gray-700 bg-white border border-gray-100"
                      }`}
                      style={
                        msg.type === "user"
                          ? {
                              background: "linear-gradient(135deg, #1e4b6e 0%, #2c6699 100%)",
                              boxShadow: "0 4px 12px rgba(30, 75, 110, 0.25)",
                            }
                          : {
                              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            }
                      }
                    >
                      <MessageContent text={msg.content} isUser={msg.type === "user"} />
                    </div>
                    <p className={`text-[9px] mt-1 font-medium text-gray-400 ${msg.type === "user" ? "text-right mr-1" : "ml-1"}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-2 h-2 bg-orange-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                        className="w-2 h-2 bg-orange-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                        className="w-2 h-2 bg-orange-600 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick actions (only show when there's just the welcome message) */}
              {messages.length === 1 && messages[0].id === "welcome" && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputValue(action);
                        setTimeout(() => {
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: Date.now(),
                              type: "user",
                              content: action,
                              timestamp: new Date().toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              }),
                            },
                          ]);
                          setInputValue("");
                          setLoading(true);
                          axios
                            .post(`${API}/chat`, {
                              message: action,
                              sessionId: sessionId,
                            })
                            .then((response) => {
                              if (response.data.success) {
                                if (response.data.sessionId) {
                                  setSessionId(response.data.sessionId);
                                }
                                setMessages((prev) => [
                                  ...prev,
                                  {
                                    id: Date.now() + 1,
                                    type: "bot",
                                    content: response.data.reply,
                                    timestamp: new Date().toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }),
                                  },
                                ]);
                              }
                            })
                            .catch((err) => {
                              const message = err.response?.data?.message || err.message || "⚠️ Connection error. Please try again.";
                              setMessages((prev) => [
                                ...prev,
                                {
                                  id: Date.now() + 1,
                                  type: "bot",
                                  content: message,
                                  timestamp: new Date().toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }),
                                },
                              ]);
                            })
                            .finally(() => setLoading(false));
                        }, 0);
                      }}
                      className="px-3 py-2 bg-white border border-orange-200 rounded-xl text-xs font-semibold text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all shadow-sm hover:shadow-md"
                    >
                      {action}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              className="shrink-0 p-3 border-t border-gray-100"
              style={{ background: "#ffffff" }}
            >
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-1 border border-gray-200 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about careers, courses..."
                  disabled={loading}
                  className="flex-1 bg-transparent py-3 text-sm outline-none text-gray-700 placeholder-gray-400 font-medium"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.85 }}
                  disabled={loading || !inputValue.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-30 transition-all shrink-0"
                  style={{
                    background: loading || !inputValue.trim()
                      ? "#d1d5db"
                      : "linear-gradient(135deg, #e67e22, #f39c12)",
                    boxShadow: loading || !inputValue.trim()
                      ? "none"
                      : "0 4px 12px rgba(230, 126, 34, 0.35)",
                  }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  )}
                </motion.button>
              </form>
              <p className="text-center text-[9px] text-gray-400 mt-2 font-medium tracking-wider">
                Powered by Groq AI — Career guidance only
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Simple markdown-like renderer
const MessageContent = ({ text, isUser }) => {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div>
      {lines.map((line, idx) => {
        // Bold text
        let processed = line.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="font-bold">$1</strong>'
        );

        // Headers
        if (processed.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className={`font-bold text-sm mt-3 mb-1 ${isUser ? "text-blue-100" : "text-[#1e4b6e]"}`}
              dangerouslySetInnerHTML={{ __html: processed.substring(4) }}
            />
          );
        }
        if (processed.startsWith("## ")) {
          return (
            <h3
              key={idx}
              className={`font-bold text-base mt-3 mb-1 ${isUser ? "text-blue-100" : "text-[#1e4b6e]"}`}
              dangerouslySetInnerHTML={{ __html: processed.substring(3) }}
            />
          );
        }

        // Bullet points
        if (processed.match(/^[\s]*[-•✓✅🎓💼📝📊🏆]\s/)) {
          return (
            <div
              key={idx}
              className={`ml-2 mb-1 flex items-start gap-2 ${isUser ? "text-blue-100" : "text-gray-600"}`}
            >
              <span className="shrink-0 mt-0.5">
                {processed.match(/^[\s]*([-•✓✅🎓💼📝📊🏆])/)?.[1] || "•"}
              </span>
              <span
                dangerouslySetInnerHTML={{
                  __html: processed.replace(/^[\s]*[-•✓✅🎓💼📝📊🏆]\s/, ""),
                }}
              />
            </div>
          );
        }

        // Numbered list
        if (processed.match(/^\d+\.\s/)) {
          return (
            <div
              key={idx}
              className={`ml-2 mb-1 ${isUser ? "text-blue-100" : "text-gray-600"}`}
              dangerouslySetInnerHTML={{ __html: processed }}
            />
          );
        }

        // Empty line
        if (!processed.trim()) {
          return <div key={idx} className="h-2" />;
        }

        // Normal text
        return (
          <p
            key={idx}
            className={`mb-1 ${isUser ? "" : "text-gray-600"}`}
            dangerouslySetInnerHTML={{ __html: processed }}
          />
        );
      })}
    </div>
  );
};

export default ChatbotWidget;
