/**
 * Endpoints:
 * - POST   /api/ai-adviser/chat          - Chatbot message handler
 * - GET    /api/ai-adviser/profile-check - Check if profile is complete
 * - GET    /api/ai-adviser/init          - Initialize chatbot with user data
 */

const express = require("express");
const axios = require("axios");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Course = require("../models/Course");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "missing" });
const MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

const API_BASE = "https://colleges-api-india.fly.dev";
const TIMEOUT = 15000;

router.get("/profile-check", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.json({
        success: false,
        message: "Profile not found. Please complete your profile first.",
      });
    }

    const isComplete =
      profile.personalInfo?.age &&
      profile.personalInfo?.gender &&
      profile.academicInfo?.currentClass &&
      profile.location?.state &&
      profile.location?.district &&
      profile.location?.city;

    if (!isComplete) {
      return res.json({
        success: false,
        message:
          "Please complete all profile fields: Age, Gender, Class, State, District, City",
      });
    }

    res.json({
      success: true,
      message: "Profile is complete",
      profile: {
        age: profile.personalInfo?.age,
        gender: profile.personalInfo?.gender,
        class: profile.academicInfo?.currentClass,
        stream: profile.academicInfo?.stream,
        location: profile.location,
        interests: profile.careerPreferences?.interests,
        subjects: profile.academicInfo?.subjects,
      },
    });
  } catch (error) {
    console.error("Profile check error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.json({
        success: false,
        message: "Please enter a valid message",
      });
    }

    // Get user profile
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.json({
        success: false,
        message: "Profile not found. Please complete your profile first.",
      });
    }

    const userProfile = {
      age: profile.personalInfo?.age,
      gender: profile.personalInfo?.gender,
      class: profile.academicInfo?.currentClass,
      stream: profile.academicInfo?.stream || "science",
      state: profile.location?.state || "",
      district: profile.location?.district || "",
      city: profile.location?.city || "",
      interests: profile.careerPreferences?.interests || [],
      percentage: profile.academicInfo?.currentPercentage,
    };

    // Validate profile has necessary location data
    if (!userProfile.state || !userProfile.district || !userProfile.city) {
      return res.json({
        success: false,
        message: "Please complete your location details (State, District, City) in your profile first.",
      });
    }

    // Parse user message and get response
    const history = req.body.history || [];
    const response = await generateAdviserResponse(message, userProfile, history);

    console.log(`✅ Chat response generated for message: "${message}"`);

    res.json({
      success: true,
      response: response,
    });
  } catch (error) {
    console.error("❌ Chatbot error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error processing your message. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/personalized-data", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.json({
        success: false,
        message: "Profile not found",
      });
    }

    const state = profile.location?.state;
    const district = profile.location?.district;

    if (!state || !district) {
      return res.json({
        success: false,
        message: "State and District required in profile",
      });
    }

    try {
      // Fetch colleges from external API
      const collegesResponse = await axios.get(
        `${API_BASE}/colleges?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&limit=100`,
        { timeout: TIMEOUT }
      );

      const colleges = collegesResponse.data.colleges || [];

      // Separate into government and private
      const governmentColleges = colleges.filter(
        (c) => c.type?.toLowerCase()?.includes("government") || c.category === "government"
      );
      const privateColleges = colleges.filter(
        (c) => !c.type?.toLowerCase()?.includes("government") && c.category !== "government"
      );

      res.json({
        success: true,
        data: {
          governmentColleges,
          privateColleges,
          totalColleges: colleges.length,
          state,
          district,
        },
      });
    } catch (apiError) {
      console.error("External API error:", apiError.message);
      res.json({
        success: true,
        data: {
          governmentColleges: [],
          privateColleges: [],
          totalColleges: 0,
          state,
          district,
          message:
            "Unable to fetch college data at the moment. Please try again.",
        },
      });
    }
  } catch (error) {
    console.error("Personalized data error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

async function generateAdviserResponse(userMessage, userProfile, history = []) {
  try {
    const systemPrompt = `You are a ChatGPT-like highly intelligent, empathetic Career Adviser for MargDisha.
Your primary role is to provide expert career, college, and course advice based on the student's profile.

Student Profile:
- Class: ${userProfile.class}
- Stream: ${userProfile.stream}
- Core Interests: ${userProfile.interests.join(", ") || "Not specified"}
- Academic Percentage/Grade: ${userProfile.percentage || "Not provided"}
- Location: ${userProfile.city}, ${userProfile.district}, ${userProfile.state}

Guidelines:
1. ALWAYS respond in valid JSON format ONLY. 
2. The JSON structure MUST be strictly:
{
  "type": "advice",
  "text": "Your markdown-formatted conversational response here...",
  "suggestions": ["3 short follow-up questions the user can ask"]
}
3. Your advice must be personalized using their profile data. Be encouraging. Do not hallucinate real-time data unless confident.
4. "text" supports Markdown. Structure your reply nicely with bullet points, bolding, or headings if applicable.

You are interacting directly with the student. Be conversational, insightful, and knowledgeable.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(msg => ({ role: msg.role === "user" ? "user" : "assistant", content: msg.content })),
      { role: "user", content: userMessage }
    ];

    let botReply = null;
    let fallbackHit = false;

    // Retry logic across models for structured JSON
    for (const modelName of MODELS) {
      try {
        const completion = await groq.chat.completions.create({
          messages: messages,
          model: modelName,
          temperature: 0.7,
          max_tokens: 1024,
          response_format: { type: "json_object" }
        });

        const rawResponse = completion.choices[0]?.message?.content || "";
        botReply = JSON.parse(rawResponse);
        break; // Stop at first successful model
      } catch (e) {
        console.warn(`Groq Model ${modelName} attempt failed: ${e.message}`);
        fallbackHit = true;
      }
    }

    if (!botReply) {
      throw new Error("All Groq models failed to respond.");
    }

    return {
      type: botReply.type || "advice",
      text: botReply.text || "I'm still learning, but I'm here to help you navigate your career path!",
      suggestions: Array.isArray(botReply.suggestions) ? botReply.suggestions : []
    };
  } catch (error) {
    console.error("AI Adviser Generation Error:", error);
    return {
      type: "error",
      text: "❌ Unable to connect to the intelligence system. I am really sorry, but I am currently offline. Please try again later.",
      suggestions: ["Try asking again", "Look up colleges"]
    };
  }
}

async function fetchCollegesByType(state, district, type) {
  try {
    console.log(`🔍 Fetching ${type} colleges from ${district}, ${state}`);

    // Build API URL
    const apiUrl = `${API_BASE}/colleges?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&limit=100`;
    
    try {
      const response = await axios.get(apiUrl, { timeout: TIMEOUT });

      // Handle different response structures from the API
      let allColleges = [];

      // Try multiple response structure possibilities
      if (response.data && Array.isArray(response.data)) {
        allColleges = response.data;
      } else if (response.data && Array.isArray(response.data.colleges)) {
        allColleges = response.data.colleges;
      } else if (response.data && Array.isArray(response.data.data)) {
        allColleges = response.data.data;
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        allColleges = response.data.results;
      }

      console.log(`✅ Retrieved ${allColleges.length} total colleges`);

      if (allColleges.length === 0) {
        console.log(`⚠️ No colleges found in API response for ${district}`);
        return [];
      }

      // Filter by type
      let filtered = [];

      if (type.toLowerCase() === "government") {
        filtered = allColleges.filter((college) => {
          if (!college) return false;
          
          const collegeType = (college.type || "").toLowerCase().trim();
          const collegeCategory = (college.category || "").toLowerCase().trim();
          const collegeName = (college.name || "").toLowerCase().trim();

          // Check if it's a government college
          const isGov =
            collegeType.includes("government") ||
            collegeType === "govt" ||
            collegeType.includes("govt") ||
            collegeCategory === "government" ||
            collegeCategory.includes("govt") ||
            collegeName.includes("government") ||
            collegeName.includes("govt");

          return isGov;
        });
      } else if (type.toLowerCase() === "private") {
        filtered = allColleges.filter((college) => {
          if (!college) return false;

          const collegeType = (college.type || "").toLowerCase().trim();
          const collegeCategory = (college.category || "").toLowerCase().trim();
          const collegeName = (college.name || "").toLowerCase().trim();

          // Check if it's NOT a government college
          const isNotGov =
            !collegeType.includes("government") &&
            collegeType !== "govt" &&
            !collegeType.includes("govt") &&
            collegeCategory !== "government" &&
            !collegeCategory.includes("govt") &&
            !collegeName.includes("government") &&
            !collegeName.includes("govt");

          // Exclude colleges that are clearly not private
          const isPrivate =
            collegeType.includes("private") ||
            collegeCategory === "private" ||
            collegeCategory.includes("private") ||
            collegeName.includes("private");

          // If it's not government and (is private OR type is not clearly govt), include it
          return isNotGov || isPrivate;
        });
      }

      console.log(`📊 Filtered: ${filtered.length} ${type} colleges`);

      // Enrich colleges with ALL available data from API - NO field removal
      const enrichedColleges = filtered.map((college) => ({
        // Core identification
        _id: college._id || college.id || `college_${Math.random()}`,
        name: college.name || "Unknown College",
        
        // Location information
        city: college.city || district || "Unknown",
        district: college.district || district || "Unknown",
        state: college.state || state || "Unknown",
        address: college.address || `${college.city}, ${district}`,
        pincode: college.pincode || "",
        
        // College details
        type: college.type || "College",
        category: college.category || type,
        established: college.established || college.estd || college.founded || "N/A",
        
        // Contact information
        website: college.website || college.websites || "",
        phone: college.phone || college.contact || college.phone_number || "",
        email: college.email || college.contact_email || "",
        
        // Academic information
        stream: college.stream || college.streams || [],
        courses: college.courses || college.programs || [],
        affiliations: college.affiliations || college.affiliated_to || college.affiliation || "",
        
        // Infrastructure
        hostels: college.hostels || college.hostel_available || false,
        library: college.library || college.has_library || false,
        sports: college.sports || college.sports_facilities || false,
        lab: college.lab || college.laboratories || false,
        
        // Rankings and ratings
        ranking: college.ranking || college.nirf_ranking || "",
        rating: college.rating || college.avg_rating || "",
        reviews: college.reviews || college.review_count || 0,
        
        // Admission information
        seats: college.seats || college.total_seats || "",
        cutoff: college.cutoff || college.admission_cutoff || "",
        entrance_exam: college.entrance_exam || college.exam || "",
        
        // Additional details
        description: college.description || college.about || "",
        accreditation: college.accreditation || "",
        naac_rating: college.naac_rating || "",
        availability: college.availability || "Available",
        
        // Any other fields from API
        ...college // Spread remaining fields
      }));

      return enrichedColleges;
    } catch (apiError) {
      console.error("External API error:", apiError.message);
      console.error("API URL was:", apiUrl);

      // Return mock data as fallback to help users
      console.log(`⚠️ Falling back to sample data for ${district}`);
      return generateMockColleges(state, district, type);
    }
  } catch (error) {
    console.error("Error in fetchCollegesByType:", error);
    return [];
  }
}

function generateMockColleges(state, district, type) {
  const governmentColleges = [
    {
      _id: "mock_gov_1",
      name: `Government Engineering College, ${district}`,
      city: district,
      district: district,
      state: state,
      type: "Government",
      category: "government",
      established: "2005",
      website: "www.gecollege.edu.in",
      phone: "+91-9999-999999",
      address: `${district}, ${state}`,
    },
    {
      _id: "mock_gov_2",
      name: `Government Science College, ${district}`,
      city: district,
      district: district,
      state: state,
      type: "Government",
      category: "government",
      established: "2010",
      website: "www.gscollege.edu.in",
      phone: "+91-8888-888888",
      address: `${district}, ${state}`,
    },
    {
      _id: "mock_gov_3",
      name: `Government Arts & Commerce College, ${district}`,
      city: district,
      district: district,
      state: state,
      type: "Government",
      category: "government",
      established: "2000",
      website: "www.gaccollege.edu.in",
      phone: "+91-7777-777777",
      address: `${district}, ${state}`,
    },
  ];

  const privateColleges = [
    {
      _id: "mock_pvt_1",
      name: `${district} Institute of Technology`,
      city: district,
      district: district,
      state: state,
      type: "Private",
      category: "private",
      established: "2015",
      website: "www.dit.edu.in",
      phone: "+91-6666-666666",
      address: `${district}, ${state}`,
    },
    {
      _id: "mock_pvt_2",
      name: `${district} University College`,
      city: district,
      district: district,
      state: state,
      type: "Private",
      category: "private",
      established: "2012",
      website: "www.duc.edu.in",
      phone: "+91-5555-555555",
      address: `${district}, ${state}`,
    },
    {
      _id: "mock_pvt_3",
      name: `Global Education Academy, ${district}`,
      city: district,
      district: district,
      state: state,
      type: "Private",
      category: "private",
      established: "2018",
      website: "www.gea.edu.in",
      phone: "+91-4444-444444",
      address: `${district}, ${state}`,
    },
  ];

  if (type.toLowerCase() === "government") {
    return governmentColleges;
  } else if (type.toLowerCase() === "private") {
    return privateColleges;
  }

  return [...governmentColleges, ...privateColleges];
}
function capitalizeCase(str) {
  if (!str) return "";
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Fetch real courses from database (real-time) - ALL DATA from database
async function getCoursesByStream(stream) {
  try {
    console.log(`📚 Fetching real-time courses for stream: ${stream}`);
    
    const queryStream = (stream || "science").toLowerCase().trim();
    
    // Fetch ALL course data from database - no field restrictions
    const courses = await Course.find({ stream: queryStream })
      .lean() // Use lean for faster queries
      .limit(15);
    
    console.log(`✅ Retrieved ${courses.length} real courses from database`);
    
    if (courses.length === 0) {
      console.warn(`⚠️ No courses found in database for stream: ${queryStream}`);
      return [];
    }
    
    // Return all fields from database - comprehensive data
    return courses.map(course => ({
      // Core information
      _id: course._id,
      name: course.name || "Unknown Course",
      code: course.code || "N/A",
      stream: course.stream,
      degree: course.degree || "Bachelor",
      
      // Duration details
      duration: course.duration?.years 
        ? `${course.duration.years} years${course.duration.months ? ` ${course.duration.months} months` : ""}` 
        : "3 years",
      
      // Description
      description: course.description || "",
      
      // Eligibility requirements
      eligibility: {
        minimumMarks: course.eligibility?.minimumMarks || "60%",
        requiredSubjects: course.eligibility?.requiredSubjects || [],
        entranceExam: course.eligibility?.entranceExam || "12th pass",
      },
      
      // Career paths
      careerPaths: course.careerPaths || [],
      
      // Higher education options
      higherEducationOptions: course.higherEducationOptions || [],
      
      // Government exams available
      governmentExams: course.governmentExams || [],
      
      // Job profiles
      jobProfiles: course.jobProfiles || [],
      
      // Skills developed
      skillsDeveloped: course.skillsDeveloped || [],
      
      // Average salary information
      averageSalary: course.averageSalary || "",
      salaryRange: course.salaryRange || {},
      
      // Selection criteria
      selectionCriteria: course.selectionCriteria || [],
      
      // Industry focus
      industries: course.industries || [],
      
      // Colleges offering this course
      topColleges: course.topColleges || [],
      
      // Tips and insights
      tips: course.tips || "",
      
      // Any additional fields from the database
      ...course // Spread all remaining fields
    }));
  } catch (error) {
    console.error(`❌ Error fetching courses from database: ${error.message}`);
    throw error;
  }
}


module.exports = router;
