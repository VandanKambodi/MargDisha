/**
 * Career Chatbot API - Gemini Powered
 * Only answers career-related questions
 * 
 * Endpoints:
 * - POST /api/career-chatbot/chat - Send a message to the career chatbot
 */

const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

// Initialize Groq
// The SDK automatically uses process.env.GROQ_API_KEY, but you can explicitly pass it
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "missing" });

// Models to try in order (fallback chain)
const MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
// Simple delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CAREER_SYSTEM_PROMPT = `You are MargDisha Career Adviser, an AI assistant that ONLY answers career-related questions.

Your expertise includes:
- Career guidance and counseling
- Course and degree recommendations
- College and university information
- Job market trends and opportunities
- Resume and interview tips
- Skill development advice
- Career transitions and growth paths
- Salary expectations and negotiations
- Industry insights
- Entrance exams and competitive exams
- Scholarships and financial aid for education
- Professional certifications
- Internship guidance
- Study abroad options
- Career paths after 10th, 12th, graduation, post-graduation

STRICT RULES:
1. You MUST ONLY answer career-related questions. If a user asks about anything unrelated to careers, education, jobs, courses, or professional development, politely decline and redirect them to ask career-related questions.
2. For non-career questions, respond with: "I'm your Career Adviser and can only help with career-related questions. Please ask me about courses, colleges, career paths, jobs, skills, or any other career-related topic! 🎯"
3. Keep responses concise, helpful, and actionable.
4. Use emojis sparingly to make responses friendly.
5. When recommending, provide specific and practical advice.
6. Be encouraging and supportive.
7. Format responses with proper structure using markdown-like formatting with bold text (**text**) and bullet points.
8. For Indian students, be aware of Indian education system, entrance exams (JEE, NEET, CAT, GATE, UPSC etc.), and Indian career landscape.`;

// Store conversation history per session (in-memory, resets on server restart)
const conversationSessions = new Map();

// Cleanup old sessions every 30 minutes
setInterval(() => {
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  for (const [key, session] of conversationSessions.entries()) {
    if (session.lastActivity < thirtyMinutesAgo) {
      conversationSessions.delete(key);
    }
  }
}, 30 * 60 * 1000);

router.post("/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid message",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Groq API key not configured. Please add GROQ_API_KEY to .env file.",
      });
    }

    // Get or create session
    const sid = sessionId || `anon_${Date.now()}`;
    if (!conversationSessions.has(sid)) {
      conversationSessions.set(sid, {
        history: [],
        lastActivity: Date.now(),
      });
    }

    const session = conversationSessions.get(sid);
    session.lastActivity = Date.now();

    // Try models with retry logic
    let botReply = null;
    let lastError = null;

    for (const modelName of MODELS) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const messages = [
            { role: "system", content: CAREER_SYSTEM_PROMPT },
            { role: "assistant", content: "Understood! I am MargDisha Career Adviser. I will only answer career-related questions and politely decline anything else. How can I help with your career today? 🎯" },
            ...session.history,
            { role: "user", content: message }
          ];

          const response = await groq.chat.completions.create({
            model: modelName,
            messages: messages,
            max_tokens: 1024,
            temperature: 0.7,
          });

          botReply = response.choices[0]?.message?.content || "";
          console.log(`✅ Success with model: ${modelName} (attempt ${attempt})`);
          break; // Success — exit retry loop
        } catch (err) {
          lastError = err;
          console.warn(`⚠️ Model ${modelName} attempt ${attempt} failed: ${err.message}`);

          // If rate limited, wait before retry (exponential backoff)
          if (err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("Too Many Requests")) {
            const waitTime = Math.pow(2, attempt) * 1000;// 2s, 4s, 6s
            console.log(`⏳ Rate limited. Waiting ${waitTime}ms before retry...`);
            await delay(waitTime);
          } else {
            break; // Non-rate-limit error — try next model
          }
        }
      }
      if (botReply) break; // Got a response — stop trying other models
    }

    if (!botReply) {
      // All retries exhausted
      const isRateLimit = lastError?.message?.includes("429") || lastError?.message?.includes("quota");
      return res.status(isRateLimit ? 429 : 500).json({
        success: false,
        message: isRateLimit
          ? "🔄 The AI service is temporarily busy due to high demand. Please wait a moment and try again."
          : "Sorry, I'm having trouble responding right now. Please try again.",
      });
    }

    // Save to session history (keep last 20 messages)
    session.history.push(
      { role: "user", content: message },
      { role: "assistant", content: botReply }
    );

    // Trim history to prevent memory overflow
    if (session.history.length > 40) {
      session.history = session.history.slice(-20);
    }

    console.log(`✅ Career chatbot response generated for: "${message.substring(0, 50)}..."`);

    res.json({
      success: true,
      reply: botReply,
      sessionId: sid,
    });
  } catch (error) {
    console.error("❌ Career chatbot error:", error.message);
    
    // Handle specific Groq API errors
    if (error.message?.includes("API_KEY") || error.message?.includes("authentication") || error.status === 401) {
      return res.status(500).json({
        success: false,
        message: "Invalid Groq API key. Please check your GROQ_API_KEY in .env file.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Sorry, I'm having trouble responding right now. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
