/**
 * ====================================================================
 * EXTERNAL COLLEGES & COURSES API ROUTER (No Database)
 * ====================================================================
 *
 * Everything is fetched LIVE from the official India Colleges API:
 * https://colleges-api-india.fly.dev
 *
 * NO data is stored in MongoDB. All data is fetched, transformed,
 * and returned in real-time. Only states/districts are cached in
 * memory for performance.
 *
 * ====================================================================
 */

const express = require("express");
const axios = require("axios");
const router = express.Router();

// ── Config ──────────────────────────────────────────────────────────
const API_BASE = "https://colleges-api-india.fly.dev";
const TIMEOUT = 15000;

// ── In-memory cache (no DB) ─────────────────────────────────────────
let statesCache = null;
let statesCacheTime = null;
const districtCache = {}; // { stateName: { data, time } }
const collegesCache = {}; // { key: { data, time } }
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function isCacheValid(time) {
  return time && Date.now() - time < CACHE_TTL;
}

// ── Course data by college category ─────────────────────────────────
// Since the external API doesn't provide courses, we derive courses
// based on the college's category/type – realistic for Indian colleges
const COURSES_BY_TYPE = {
  engineering: [
    {
      name: "B.Tech Computer Science",
      code: "B.Tech CS",
      stream: "engineering",
      degree: "bachelor",
      duration: "4 years",
      fees: 125000,
    },
    {
      name: "B.Tech Electronics & Communication",
      code: "B.Tech ECE",
      stream: "engineering",
      degree: "bachelor",
      duration: "4 years",
      fees: 120000,
    },
    {
      name: "B.Tech Mechanical Engineering",
      code: "B.Tech ME",
      stream: "engineering",
      degree: "bachelor",
      duration: "4 years",
      fees: 115000,
    },
    {
      name: "B.Tech Civil Engineering",
      code: "B.Tech CE",
      stream: "engineering",
      degree: "bachelor",
      duration: "4 years",
      fees: 110000,
    },
    {
      name: "B.Tech Electrical Engineering",
      code: "B.Tech EE",
      stream: "engineering",
      degree: "bachelor",
      duration: "4 years",
      fees: 115000,
    },
    {
      name: "M.Tech Computer Science",
      code: "M.Tech CS",
      stream: "engineering",
      degree: "master",
      duration: "2 years",
      fees: 85000,
    },
  ],
  medical: [
    {
      name: "MBBS",
      code: "MBBS",
      stream: "medical",
      degree: "bachelor",
      duration: "5.5 years",
      fees: 250000,
    },
    {
      name: "BDS (Dental Surgery)",
      code: "BDS",
      stream: "medical",
      degree: "bachelor",
      duration: "5 years",
      fees: 200000,
    },
    {
      name: "B.Pharm (Pharmacy)",
      code: "B.Pharm",
      stream: "medical",
      degree: "bachelor",
      duration: "4 years",
      fees: 80000,
    },
    {
      name: "BAMS (Ayurveda)",
      code: "BAMS",
      stream: "medical",
      degree: "bachelor",
      duration: "5.5 years",
      fees: 150000,
    },
    {
      name: "B.Sc Nursing",
      code: "B.Sc Nursing",
      stream: "medical",
      degree: "bachelor",
      duration: "4 years",
      fees: 70000,
    },
  ],
  arts: [
    {
      name: "Bachelor of Arts",
      code: "BA",
      stream: "arts",
      degree: "bachelor",
      duration: "3 years",
      fees: 15000,
    },
    {
      name: "BA English Literature",
      code: "BA Eng",
      stream: "arts",
      degree: "bachelor",
      duration: "3 years",
      fees: 18000,
    },
    {
      name: "BA Political Science",
      code: "BA Pol",
      stream: "arts",
      degree: "bachelor",
      duration: "3 years",
      fees: 15000,
    },
    {
      name: "BA History",
      code: "BA Hist",
      stream: "arts",
      degree: "bachelor",
      duration: "3 years",
      fees: 15000,
    },
    {
      name: "Master of Arts",
      code: "MA",
      stream: "arts",
      degree: "master",
      duration: "2 years",
      fees: 20000,
    },
  ],
  science: [
    {
      name: "B.Sc Physics",
      code: "B.Sc Phy",
      stream: "science",
      degree: "bachelor",
      duration: "3 years",
      fees: 25000,
    },
    {
      name: "B.Sc Chemistry",
      code: "B.Sc Chem",
      stream: "science",
      degree: "bachelor",
      duration: "3 years",
      fees: 25000,
    },
    {
      name: "B.Sc Mathematics",
      code: "B.Sc Math",
      stream: "science",
      degree: "bachelor",
      duration: "3 years",
      fees: 22000,
    },
    {
      name: "B.Sc Biology",
      code: "B.Sc Bio",
      stream: "science",
      degree: "bachelor",
      duration: "3 years",
      fees: 25000,
    },
    {
      name: "M.Sc Physics",
      code: "M.Sc Phy",
      stream: "science",
      degree: "master",
      duration: "2 years",
      fees: 30000,
    },
  ],
  commerce: [
    {
      name: "Bachelor of Commerce",
      code: "B.Com",
      stream: "commerce",
      degree: "bachelor",
      duration: "3 years",
      fees: 20000,
    },
    {
      name: "B.Com Honours",
      code: "B.Com(H)",
      stream: "commerce",
      degree: "bachelor",
      duration: "3 years",
      fees: 25000,
    },
    {
      name: "BBA (Business Administration)",
      code: "BBA",
      stream: "commerce",
      degree: "bachelor",
      duration: "3 years",
      fees: 50000,
    },
    {
      name: "MBA",
      code: "MBA",
      stream: "commerce",
      degree: "master",
      duration: "2 years",
      fees: 150000,
    },
    {
      name: "M.Com",
      code: "M.Com",
      stream: "commerce",
      degree: "master",
      duration: "2 years",
      fees: 25000,
    },
  ],
  law: [
    {
      name: "BA LLB (Integrated)",
      code: "BA LLB",
      stream: "law",
      degree: "bachelor",
      duration: "5 years",
      fees: 80000,
    },
    {
      name: "LLB",
      code: "LLB",
      stream: "law",
      degree: "bachelor",
      duration: "3 years",
      fees: 60000,
    },
    {
      name: "LLM",
      code: "LLM",
      stream: "law",
      degree: "master",
      duration: "2 years",
      fees: 70000,
    },
  ],
  education: [
    {
      name: "B.Ed (Education)",
      code: "B.Ed",
      stream: "education",
      degree: "bachelor",
      duration: "2 years",
      fees: 40000,
    },
    {
      name: "D.El.Ed (Elementary Education)",
      code: "D.El.Ed",
      stream: "education",
      degree: "diploma",
      duration: "2 years",
      fees: 25000,
    },
    {
      name: "M.Ed",
      code: "M.Ed",
      stream: "education",
      degree: "master",
      duration: "2 years",
      fees: 45000,
    },
  ],
  general: [
    {
      name: "Bachelor of Arts",
      code: "BA",
      stream: "arts",
      degree: "bachelor",
      duration: "3 years",
      fees: 15000,
    },
    {
      name: "Bachelor of Science",
      code: "B.Sc",
      stream: "science",
      degree: "bachelor",
      duration: "3 years",
      fees: 25000,
    },
    {
      name: "Bachelor of Commerce",
      code: "B.Com",
      stream: "commerce",
      degree: "bachelor",
      duration: "3 years",
      fees: 20000,
    },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────

// Detect college stream from its name / category
function detectCollegeStream(name, category) {
  const text = `${name} ${category}`.toLowerCase();
  if (/engineer|techno|polytechnic|iit|nit/.test(text)) return "engineering";
  if (/medic|pharma|dental|nurs|ayurved|homeo|health/.test(text))
    return "medical";
  if (/law|judicial|legal/.test(text)) return "law";
  if (/edu|teacher|training|b\.ed/.test(text)) return "education";
  if (/commerce|business|manage|mba|bba/.test(text)) return "commerce";
  if (/science|research|laboratory/.test(text)) return "science";
  if (/arts|humanities|literature|social/.test(text)) return "arts";
  return "general";
}

// Map raw API array → clean college object (NO DB)
function mapToCollege(raw) {
  if (!Array.isArray(raw) || raw.length < 6) return null;

  const [id, university, name, category, state, district] = raw;
  const stream = detectCollegeStream(name, category);
  const courses = COURSES_BY_TYPE[stream] || COURSES_BY_TYPE.general;

  const cat = (category || "").toLowerCase();
  let type = "private";
  if (cat.includes("government")) type = "government";
  else if (cat.includes("aided")) type = "aided";

  return {
    _id: `ext_${id}`,
    name: name || "Unknown College",
    type,
    stream,
    university: university || "Affiliated University",
    category: category || "",
    location: {
      state: state || "",
      district: district || "",
      city: district || "",
      address: `${name}, ${district}, ${state}`,
    },
    courses,
    totalCourses: courses.length,
    apiId: id,
  };
}

// ── External API callers ────────────────────────────────────────────

async function getStates() {
  if (statesCache && isCacheValid(statesCacheTime)) return statesCache;

  console.log("📍 Fetching states from API...");
  const res = await axios.post(`${API_BASE}/allstates`, null, {
    timeout: TIMEOUT,
  });
  statesCache = res.data || [];
  statesCacheTime = Date.now();
  console.log(`✅ ${statesCache.length} states loaded`);
  return statesCache;
}

async function getDistricts(state) {
  const cached = districtCache[state];
  if (cached && isCacheValid(cached.time)) return cached.data;

  console.log(`📍 Fetching districts for ${state}...`);
  const res = await axios.post(`${API_BASE}/districts`, null, {
    headers: { State: state },
    timeout: TIMEOUT,
  });
  const data = res.data || [];
  districtCache[state] = { data, time: Date.now() };
  console.log(`✅ ${data.length} districts for ${state}`);
  return data;
}

// ── Resilient API fetcher with retry ────────────────────────────────
const API_PAGE_SIZE = 10; // API always returns exactly 10

async function fetchPage(url, headers, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.post(url, null, { headers, timeout: TIMEOUT });
      return res.data || [];
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
      } else {
        console.error(`  ✗ Failed after ${retries} attempts: ${err.message}`);
        return null; // null = failed (distinct from [] = empty)
      }
    }
  }
}

// Fetch ALL colleges for a state (sequential with retry)
async function getCollegesByState(state) {
  const cacheKey = `state_${state}`;
  const cached = collegesCache[cacheKey];
  if (cached && isCacheValid(cached.time)) {
    console.log(`📦 Cache hit: ${cached.data.length} colleges for ${state}`);
    return cached.data;
  }

  console.log(`🏫 Fetching all colleges for ${state}...`);
  let all = [];
  let offset = 0;
  let consecutiveFailures = 0;

  while (true) {
    const batch = await fetchPage(`${API_BASE}/colleges/state`, {
      State: state,
      Offset: offset,
    });

    // Request failed after retries
    if (batch === null) {
      consecutiveFailures++;
      if (consecutiveFailures >= 3) break; // 3 consecutive failures = stop
      offset += API_PAGE_SIZE;
      continue;
    }
    consecutiveFailures = 0;

    if (!Array.isArray(batch) || batch.length === 0) break;

    // Filter null entries — API returns nulls past actual data
    const valid = batch.filter((item) => item !== null);
    if (valid.length === 0) break;
    all = all.concat(valid);

    // If batch has nulls, we've reached the end
    if (valid.length < batch.length) break;

    offset += API_PAGE_SIZE;

    // Log progress every 100 colleges
    if (all.length % 100 === 0) {
      console.log(`  ↳ ${all.length} colleges fetched so far...`);
    }
  }

  collegesCache[cacheKey] = { data: all, time: Date.now() };
  console.log(`✅ Total: ${all.length} colleges for ${state}`);
  return all;
}

// Fetch ALL colleges for a district (sequential with retry)
async function getCollegesByDistrict(district) {
  const cacheKey = `district_${district}`;
  const cached = collegesCache[cacheKey];
  if (cached && isCacheValid(cached.time)) return cached.data;

  console.log(`🏫 Fetching colleges for district: ${district}...`);
  let all = [];
  let offset = 0;
  let consecutiveFailures = 0;

  while (true) {
    const batch = await fetchPage(`${API_BASE}/colleges/district`, {
      District: district,
      Offset: offset,
    });

    if (batch === null) {
      consecutiveFailures++;
      if (consecutiveFailures >= 3) break;
      offset += API_PAGE_SIZE;
      continue;
    }
    consecutiveFailures = 0;

    if (!Array.isArray(batch) || batch.length === 0) break;

    const valid = batch.filter((item) => item !== null);
    if (valid.length === 0) break;
    all = all.concat(valid);
    if (valid.length < batch.length) break;

    offset += API_PAGE_SIZE;
  }

  collegesCache[cacheKey] = { data: all, time: Date.now() };
  console.log(`✅ Total: ${all.length} colleges for district ${district}`);
  return all;
}

// Search colleges by keyword
async function searchColleges(keyword) {
  console.log(`🔍 Searching: "${keyword}"...`);
  const res = await axios.post(`${API_BASE}/colleges/search`, null, {
    headers: { Keyword: keyword },
    timeout: TIMEOUT,
  });
  return res.data || [];
}

// ── Pagination helper ───────────────────────────────────────────────
function paginate(items, page, limit) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit) || 10));
  const total = items.length;
  const totalPages = Math.ceil(total / l) || 1;
  const start = (p - 1) * l;
  const end = start + l;

  return {
    data: items.slice(start, end),
    pagination: {
      currentPage: p,
      totalPages,
      totalColleges: total,
      limit: l,
      hasNextPage: end < total,
      hasPrevPage: p > 1,
      startItem: total > 0 ? start + 1 : 0,
      endItem: Math.min(end, total),
    },
  };
}

// =====================================================================
//  ROUTES  (all data from external API, nothing from DB)
// =====================================================================

// ── GET /  →  List colleges with pagination & filters ───────────────
router.get("/", async (req, res) => {
  try {
    const { state, district, search, page = 1, limit = 10 } = req.query;
    let raw = [];

    if (search) {
      raw = await searchColleges(search);
      if (state)
        raw = raw.filter(
          (r) =>
            Array.isArray(r) && r[4]?.toLowerCase() === state.toLowerCase(),
        );
      if (district)
        raw = raw.filter(
          (r) =>
            Array.isArray(r) && r[5]?.toLowerCase() === district.toLowerCase(),
        );
    } else if (district) {
      raw = await getCollegesByDistrict(district);
    } else if (state) {
      raw = await getCollegesByState(state);
    } else {
      raw = await getCollegesByState("Delhi");
    }

    const mapped = raw.map((r) => mapToCollege(r)).filter(Boolean);
    const result = paginate(mapped, page, limit);

    res.json({
      success: true,
      colleges: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("GET / error:", err.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching colleges",
        error: err.message,
      });
  }
});

// ── GET /filters/states ─────────────────────────────────────────────
router.get("/filters/states", async (req, res) => {
  try {
    const states = await getStates();
    res.json({
      success: true,
      states: Array.isArray(states) ? states : [],
      total: states.length,
    });
  } catch (err) {
    console.error("GET /filters/states error:", err.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching states",
        error: err.message,
      });
  }
});

// ── GET /filters/districts/:state ───────────────────────────────────
router.get("/filters/districts/:state", async (req, res) => {
  try {
    const districts = await getDistricts(req.params.state);
    res.json({
      success: true,
      state: req.params.state,
      districts: Array.isArray(districts) ? districts : [],
      total: districts.length,
    });
  } catch (err) {
    console.error("GET /filters/districts error:", err.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching districts",
        error: err.message,
      });
  }
});

// ── GET /courses/:collegeId  →  Courses for a college (from name) ──
router.get("/courses/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { state } = req.query;

    if (!state) {
      return res.json({
        success: true,
        collegeId,
        courses: COURSES_BY_TYPE.general,
        totalCourses: COURSES_BY_TYPE.general.length,
      });
    }

    const raw = await getCollegesByState(state);
    const found = raw.find(
      (r) => Array.isArray(r) && `ext_${r[0]}` === collegeId,
    );

    if (found) {
      const college = mapToCollege(found);
      return res.json({
        success: true,
        collegeId,
        collegeName: college.name,
        stream: college.stream,
        courses: college.courses,
        totalCourses: college.courses.length,
      });
    }

    res.json({
      success: true,
      collegeId,
      courses: COURSES_BY_TYPE.general,
      totalCourses: COURSES_BY_TYPE.general.length,
    });
  } catch (err) {
    console.error("GET /courses error:", err.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching courses",
        error: err.message,
      });
  }
});

// ── GET /stats/total ────────────────────────────────────────────────
router.get("/stats/total", async (req, res) => {
  try {
    const response = await axios.post(`${API_BASE}/colleges/total`, null, {
      timeout: TIMEOUT,
    });
    res.json({ success: true, total: response.data?.total || 0 });
  } catch (err) {
    console.error("GET /stats/total error:", err.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching total",
        error: err.message,
      });
  }
});

// ── POST /search ────────────────────────────────────────────────────
router.post("/search", async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.body;
    if (!keyword || !keyword.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Keyword is required" });
    }

    const raw = await searchColleges(keyword.trim());
    const mapped = raw.map((r) => mapToCollege(r)).filter(Boolean);
    const result = paginate(mapped, page, limit);

    res.json({
      success: true,
      keyword,
      colleges: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("POST /search error:", err.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Error searching colleges",
        error: err.message,
      });
  }
});

module.exports = router;
