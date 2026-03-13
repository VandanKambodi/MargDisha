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
    const response = await generateAdviserResponse(message, userProfile);

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

async function generateAdviserResponse(userMessage, userProfile) {
  const messageLower = userMessage.toLowerCase();

  // Greeting responses
  if (
    messageLower.match(
      /hi|hello|hey|greetings|namaste|start|how\s+are|good\s+morning|good\s+afternoon/i
    )
  ) {
    return {
      type: "greeting",
      text: `👋 Hello! I'm your **Personal Career Adviser**. I'm here to help you find the best colleges and courses in **${userProfile.state}** based on your profile.\n\n📍 **Your Profile Summary:**\n- Class: ${capitalizeCase(userProfile.class)}\n- Stream: ${capitalizeCase(userProfile.stream) || "Not specified"}\n- Location: ${userProfile.city}, ${userProfile.district}, ${userProfile.state}\n\nYou can ask me about:\n✓ Government & Private colleges in your area\n✓ Courses available in your location\n✓ Which college is best for you\n✓ Course details and fees\n✓ Career guidance based on your stream\n\n**What would you like to know?**`,
      suggestions: [
        "Show me government colleges",
        "What are the private colleges?",
        "Which courses are available?",
        "Recommend colleges for my stream",
      ],
    };
  }

  // Government colleges query
  if (messageLower.match(/government|government\s+colleges|govt|state\s+college/i)) {
    try {
      const colleges = await fetchCollegesByType(
        userProfile.state,
        userProfile.district,
        "government"
      );

      if (colleges.length === 0) {
        return {
          type: "colleges",
          text: `❌ No government colleges found in **${userProfile.city}, ${userProfile.district}** currently.\n\nWould you like me to show you **private colleges** instead? Private institutions also offer excellent quality education.`,
          suggestions: [
            "Show private colleges",
            "Colleges nearby",
            "About courses",
          ],
        };
      }

      let collegeList = `🏛️ **Government Colleges in ${userProfile.city}, ${userProfile.district}, ${userProfile.state}**\n\n`;
      collegeList += `📊 **Total Found: ${colleges.length} Colleges**\n\n`;

      colleges.slice(0, 5).forEach((college, idx) => {
        collegeList += `**${idx + 1}. ${college.name || "College"}**\n`;
        collegeList += `   📍 Address: ${college.address || college.city}\n`;
        collegeList += `   🎓 Type: ${capitalizeCase(college.type || "Government")}\n`;
        
        // Show establishment year
        if (college.established && college.established !== "N/A") {
          collegeList += `   📅 Established: ${college.established}\n`;
        }
        
        // Show streams offered
        if (college.stream && college.stream.length > 0) {
          collegeList += `   📚 Streams: ${college.stream.join(", ")}\n`;
        }
        
        // Show NIRF ranking if available
        if (college.ranking || college.nirf_ranking) {
          collegeList += `   🏆 Ranking: ${college.ranking || college.nirf_ranking}\n`;
        }
        
        // Show accreditation
        if (college.accreditation) {
          collegeList += `   ✅ Accreditation: ${college.accreditation}\n`;
        }
        
        // Show available seats if available  
        if (college.seats) {
          collegeList += `   🎯 Total Seats: ${college.seats}\n`;
        }
        
        // Show cutoff score if available
        if (college.cutoff) {
          collegeList += `   📊 Cutoff Score: ${college.cutoff}\n`;
        }
        
        // Show facilities
        const facilities = [];
        if (college.hostels) facilities.push("Hostel");
        if (college.library) facilities.push("Library");
        if (college.sports) facilities.push("Sports");
        if (college.lab) facilities.push("Labs");
        if (facilities.length > 0) {
          collegeList += `   🏢 Facilities: ${facilities.join(", ")}\n`;
        }
        
        collegeList += `\n`;
      });

      if (colleges.length > 5) {
        collegeList += `\n... and **${colleges.length - 5} more** government colleges in your area.\n`;
      }

      collegeList += `\n✅ **What would you like to do next?**\n- Learn about available courses\n- Compare with private colleges\n- Get career recommendations`;

      return {
        type: "colleges",
        text: collegeList,
        suggestions: [
          "Tell me about courses",
          "Show private colleges",
          "Recommend best college",
        ],
        data: colleges,
      };
    } catch (error) {
      console.error("Error in government colleges:", error);
      return {
        type: "error",
        text: `❌ Error fetching government colleges. Please try again in a moment.`,
        suggestions: ["Try again", "Show private colleges", "Ask another question"],
      };
    }
  }

  // Private colleges query
  if (messageLower.match(/private|private\s+colleges|non-government|independent/i)) {
    try {
      const colleges = await fetchCollegesByType(
        userProfile.state,
        userProfile.district,
        "private"
      );

      if (colleges.length === 0) {
        return {
          type: "colleges",
          text: `❌ No private colleges found in **${userProfile.city}, ${userProfile.district}** currently.\n\nWould you like me to show you **government colleges** instead?`,
          suggestions: [
            "Show government colleges",
            "Colleges in nearby areas",
            "Available courses",
          ],
        };
      }

      let collegeList = `🏢 **Private Colleges in ${userProfile.city}, ${userProfile.district}, ${userProfile.state}**\n\n`;
      collegeList += `📊 **Total Found: ${colleges.length} Colleges**\n\n`;

      colleges.slice(0, 5).forEach((college, idx) => {
        collegeList += `**${idx + 1}. ${college.name || "College"}**\n`;
        collegeList += `   📍 Address: ${college.address || college.city}\n`;
        collegeList += `   🎓 Type: ${capitalizeCase(college.type || "Private")}\n`;
        
        // Show establishment year
        if (college.established && college.established !== "N/A") {
          collegeList += `   📅 Established: ${college.established}\n`;
        }
        
        // Show streams offered
        if (college.stream && college.stream.length > 0) {
          collegeList += `   📚 Streams: ${college.stream.join(", ")}\n`;
        }
        
        // Show NIRF ranking if available
        if (college.ranking || college.nirf_ranking) {
          collegeList += `   🏆 Ranking: ${college.ranking || college.nirf_ranking}\n`;
        }
        
        // Show accreditation
        if (college.accreditation) {
          collegeList += `   ✅ Accreditation: ${college.accreditation}\n`;
        }
        
        // Show available seats if available
        if (college.seats) {
          collegeList += `   🎯 Total Seats: ${college.seats}\n`;
        }
        
        // Show cutoff score if available
        if (college.cutoff) {
          collegeList += `   📊 Cutoff Score: ${college.cutoff}\n`;
        }
        
        // Show facilities
        const facilities = [];
        if (college.hostels) facilities.push("Hostel");
        if (college.library) facilities.push("Library");
        if (college.sports) facilities.push("Sports");
        if (college.lab) facilities.push("Labs");
        if (facilities.length > 0) {
          collegeList += `   🏢 Facilities: ${facilities.join(", ")}\n`;
        }
        
        collegeList += `\n`;
      });

      if (colleges.length > 5) {
        collegeList += `\n... and **${colleges.length - 5} more** private colleges in your area.\n`;
      }

      collegeList += `\n✅ **What would you like to do next?**\n- Learn about available courses\n- Compare with government colleges\n- Get career recommendations`;

      return {
        type: "colleges",
        text: collegeList,
        suggestions: [
          "Tell me about courses",
          "Show government colleges",
          "Career recommendations",
        ],
        data: colleges,
      };
    } catch (error) {
      console.error("Error in private colleges:", error);
      return {
        type: "error",
        text: `❌ Error fetching private colleges. Please try again in a moment.`,
        suggestions: ["Try again", "Show government colleges", "Ask another question"],
      };
    }
  }

  // Courses query
  if (messageLower.match(/courses|what\s+courses|course\s+details|available\s+courses|course\s+options/i)) {
    try {
      const courses = await getCoursesByStream(userProfile.stream || "science");
      
      if (courses.length === 0) {
        return {
          type: "error",
          text: `📚 **No Courses Available**\n\n❌ Currently, there are no courses configured in the system for the **${capitalizeCase(userProfile.stream)}** stream.\n\n**Please contact the administrator to seed the course database** with courses for your stream.\n\n**In the meantime, you can:**\n✓ Browse available colleges in your area\n✓ Get personalized college recommendations\n✓ Explore career guidance information`,
          suggestions: [
            "Show me colleges",
            "Career recommendations",
            "Ask something else",
          ],
        };
      }

      let courseList = `📚 **Available Courses - ${capitalizeCase(userProfile.stream)} Stream**\n`;
      courseList += `📍 Location: ${userProfile.city}, ${userProfile.district}, ${userProfile.state}\n\n`;
      courseList += `**Total Courses Available: ${courses.length}**\n\n`;

      courses.slice(0, 8).forEach((course, idx) => {
        courseList += `**${idx + 1}. ${course.name}**\n`;
        courseList += `   📖 Code: ${course.code}\n`;
        courseList += `   ⏱️ Duration: ${course.duration}\n`;
        courseList += `   � Degree: ${capitalizeCase(course.degree)}\n`;
        courseList += `   ✅ Entrance Exam: ${course.eligibility?.entranceExam || "12th pass"}\n`;
        
        // Show eligibility requirements if available
        if (course.eligibility?.requiredSubjects && course.eligibility.requiredSubjects.length > 0) {
          courseList += `   📚 Required Subjects: ${course.eligibility.requiredSubjects.join(", ")}\n`;
        }
        
        // Show career paths if available
        if (course.careerPaths && course.careerPaths.length > 0) {
          const careers = course.careerPaths.slice(0, 2).map(c => c.jobTitle || c).join(", ");
          courseList += `   💼 Career Paths: ${careers}\n`;
        }
        
        // Show job profiles if available
        if (course.jobProfiles && course.jobProfiles.length > 0) {
          const jobs = course.jobProfiles.slice(0, 2).join(", ");
          courseList += `   👔 Job Profiles: ${jobs}\n`;
        }
        
        // Show average salary if available
        if (course.averageSalary) {
          courseList += `   💰 Average Salary: ${course.averageSalary}\n`;
        }
        
        courseList += `\n`;
      });

      courseList += `✅ **Next Steps:**\n- Find colleges offering these courses\n- Compare government vs private colleges\n- Get detailed career information`;

      return {
        type: "courses",
        text: courseList,
        suggestions: [
          "Which colleges offer these?",
          "Show government colleges",
          "Career recommendations",
        ],
        data: courses,
      };
    } catch (error) {
      console.error("Error fetching courses:", error);
      return {
        type: "error",
        text: `❌ **Error Fetching Courses**\n\nUnable to fetch course data at the moment. Please try again in a moment.\n\n**In the meantime, you can:**\n✓ Browse colleges in your area\n✓ Get college recommendations\n✓ Explore other options`,
        suggestions: [
          "Try again",
          "Show colleges",
          "Career guidance",
        ],
      };
    }
  }

  // Recommendation based on stream
  if (messageLower.match(/recommend|best|suited|for\s+me|match|which\s+college/i)) {
    try {
      const stream = userProfile.stream || "science";
      const courses = await getCoursesByStream(stream);
      
      // Fetch both government and private colleges
      const govColleges = await fetchCollegesByType(
        userProfile.state,
        userProfile.district,
        "government"
      );
      const pvtColleges = await fetchCollegesByType(
        userProfile.state,
        userProfile.district,
        "private"
      );

      let recommendation = `🎯 **Personalized College Recommendations**\n\n`;
      recommendation += `👤 **Your Profile:**\n`;
      recommendation += `- Class: ${capitalizeCase(userProfile.class)}\n`;
      recommendation += `- Stream: ${capitalizeCase(stream)}\n`;
      recommendation += `- Location: ${userProfile.city}, ${userProfile.district}, ${userProfile.state}\n\n`;

      recommendation += `📚 **Recommended Courses** (${capitalizeCase(stream)} Stream):\n`;
      courses.slice(0, 3).forEach((c, i) => {
        recommendation += `${i + 1}. ${c.name} (${c.duration})\n`;
      });

      recommendation += `\n🏫 **Available Colleges in Your Area:**\n`;
      recommendation += `- 🏛️ Government Colleges: ${govColleges.length} options\n`;
      recommendation += `- 🏢 Private Colleges: ${pvtColleges.length} options\n`;

      recommendation += `\n✅ **Recommended Path for You:**\n`;
      recommendation += `1. **Government Colleges** - Better for cost-effectiveness and reputation\n`;
      recommendation += `   - Established infrastructure\n`;
      recommendation += `   - Lower fees\n`;
      recommendation += `   - Strong faculty\n\n`;
      
      recommendation += `2. **Private Colleges** - Modern facilities and flexibility\n`;
      recommendation += `   - Advanced labs and resources\n`;
      recommendation += `   - Industry partnerships\n`;
      recommendation += `   - Career guidance programs\n\n`;

      recommendation += `🚀 **Your Next Steps:**\n`;
      recommendation += `1. Compare government colleges in your area\n`;
      recommendation += `2. Check private colleges for modern facilities\n`;
      recommendation += `3. Review courses offered by each college\n`;
      recommendation += `4. Take our Career Quiz for deeper insights\n`;
      recommendation += `5. Save your favorite colleges`;

      return {
        type: "recommendation",
        text: recommendation,
        suggestions: [
          "Show government colleges",
          "Show private colleges",
          "Tell me about courses",
        ],
        data: { govColleges, pvtColleges, courses },
      };
    } catch (error) {
      console.error("Recommendation error:", error);
      const courses = await getCoursesByStream(userProfile.stream || "science");
      return {
        type: "recommendation",
        text: `💡 **Personalized Recommendation for You**\n\n👤 **Your Profile:**\n- Class: ${capitalizeCase(userProfile.class)}\n- Stream: ${capitalizeCase(userProfile.stream) || "Science"}\n- Location: ${userProfile.city}, ${userProfile.district}, ${userProfile.state}\n\n📚 **Recommended Courses:**\n${courses
          .slice(0, 3)
          .map((c, i) => `${i + 1}. ${c.name}`)
          .join("\n")}\n\n**Next Steps:**\n1. ✅ View colleges offering these courses\n2. ✅ Check government and private options\n3. ✅ Compare fees and facilities\n4. ✅ Take the Career Quiz for deeper insights\n\n**Would you like to:**\n- See colleges in your area?\n- Know more about a specific course?\n- Compare government vs private colleges?`,
        suggestions: [
          "Show colleges",
          "Career guidance",
          "Available courses",
        ],
      };
    }
  }

  // General career advice
  if (messageLower.match(/career|guidance|advice|help|guide|stream|choose|subject/i)) {
    return {
      type: "advice",
      text: `🎯 **Career Guidance & Suggestions**\n\nBased on **Class ${userProfile.class}** students:\n\n**If you're interested in:**\n- 🔬 **Science** → Engineering, Medical, Research fields\n- 📊 **Commerce** → Business, Finance, Accounting, Economics\n- 📖 **Arts** → Humanities, Social Sciences, Administration\n\n**My Suggestions for You:**\n1. **Complete your profile** with interests and subjects\n2. **Take the Psychometric Test** on your Dashboard\n3. **Take the Career Quiz** to identify suitable fields\n4. **Explore colleges** in your area\n5. **Compare courses** and career outcomes\n\n**Available in your area (${userProfile.city}):**\n- Government colleges with better infrastructure\n- Private colleges with modern facilities\n- Specialized coaching centers\n\n**What would you like to do next?**\n- View colleges\n- Take a career assessment\n- Know about specific courses`,
      suggestions: [
        "Show colleges nearby",
        "Career assessment",
        "Course details",
      ],
    };
  }

  // Default response for unknown queries
  return {
    type: "default",
    text: `I didn't quite understand that. Let me help you better! 🎓\n\n**I can assist with:**\n\n✅ **Finding Colleges**\n  - "Show government colleges"\n  - "Tell me about private colleges"\n  - "Colleges in my area"\n\n✅ **Course Information**\n  - "What courses are available?"\n  - "Tell me about engineering courses"\n  - "Commerce stream courses"\n\n✅ **Career Guidance**\n  - "Recommend colleges for me"\n  - "Career advice based on my profile"\n  - "Suitable streams for my score"\n\n✅ **Location-based Help**\n  - You're in: **${userProfile.city}, ${userProfile.district}, ${userProfile.state}**\n\n**Try asking:** "Which colleges are best for me?"`,
    suggestions: [
      "Show government colleges",
      "Available courses",
      "Career recommendations",
    ],
  };
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
