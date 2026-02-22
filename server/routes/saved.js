const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const SavedItem = require("../models/SavedItem");

// ── Save a college ────────────────────────────────────────────────────
router.post("/college", auth, async (req, res) => {
  try {
    const { college } = req.body;
    if (!college || !college._id) {
      return res
        .status(400)
        .json({ success: false, message: "College data required" });
    }

    // Check duplicate
    const exists = await SavedItem.findOne({
      userId: req.user._id,
      itemType: "college",
      "collegeData._id": college._id,
    });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "College already saved" });
    }

    const saved = new SavedItem({
      userId: req.user._id,
      itemType: "college",
      collegeData: college,
    });
    await saved.save();

    res.json({ success: true, message: "College saved", savedItem: saved });
  } catch (err) {
    console.error("Error saving college:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Save a course ─────────────────────────────────────────────────────
router.post("/course", auth, async (req, res) => {
  try {
    const { course } = req.body;
    if (!course || !course._id) {
      return res
        .status(400)
        .json({ success: false, message: "Course data required" });
    }

    const exists = await SavedItem.findOne({
      userId: req.user._id,
      itemType: "course",
      "courseData._id": course._id,
    });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Course already saved" });
    }

    const saved = new SavedItem({
      userId: req.user._id,
      itemType: "course",
      courseData: course,
    });
    await saved.save();

    res.json({ success: true, message: "Course saved", savedItem: saved });
  } catch (err) {
    console.error("Error saving course:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Remove saved college ──────────────────────────────────────────────
router.delete("/college/:collegeId", auth, async (req, res) => {
  try {
    const result = await SavedItem.findOneAndDelete({
      userId: req.user._id,
      itemType: "college",
      "collegeData._id": req.params.collegeId,
    });
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Saved college not found" });
    }
    res.json({ success: true, message: "College removed from saved" });
  } catch (err) {
    console.error("Error removing college:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Remove saved course ───────────────────────────────────────────────
router.delete("/course/:courseId", auth, async (req, res) => {
  try {
    const result = await SavedItem.findOneAndDelete({
      userId: req.user._id,
      itemType: "course",
      "courseData._id": req.params.courseId,
    });
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Saved course not found" });
    }
    res.json({ success: true, message: "Course removed from saved" });
  } catch (err) {
    console.error("Error removing course:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── List saved colleges ───────────────────────────────────────────────
router.get("/colleges", auth, async (req, res) => {
  try {
    const items = await SavedItem.find({
      userId: req.user._id,
      itemType: "college",
    }).sort({ savedAt: -1 });

    res.json({
      success: true,
      colleges: items.map((i) => ({
        ...(i.collegeData || {}),
        savedAt: i.savedAt,
        savedItemId: i._id,
      })),
      total: items.length,
    });
  } catch (err) {
    console.error("Error fetching saved colleges:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── List saved courses ────────────────────────────────────────────────
router.get("/courses", auth, async (req, res) => {
  try {
    const items = await SavedItem.find({
      userId: req.user._id,
      itemType: "course",
    }).sort({ savedAt: -1 });

    res.json({
      success: true,
      courses: items.map((i) => ({
        ...(i.courseData || {}),
        savedAt: i.savedAt,
        savedItemId: i._id,
      })),
      total: items.length,
    });
  } catch (err) {
    console.error("Error fetching saved courses:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Get all saved IDs (for checking if already saved) ─────────────────
router.get("/ids", auth, async (req, res) => {
  try {
    const items = await SavedItem.find({ userId: req.user._id }).select(
      "itemType collegeData._id courseData._id",
    );
    const collegeIds = items
      .filter((i) => i.itemType === "college")
      .map((i) => i.collegeData?._id);
    const courseIds = items
      .filter((i) => i.itemType === "course")
      .map((i) => i.courseData?._id);
    res.json({ success: true, collegeIds, courseIds });
  } catch (err) {
    console.error("Error fetching saved IDs:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
