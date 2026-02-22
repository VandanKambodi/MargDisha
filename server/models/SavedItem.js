const mongoose = require("mongoose");

const savedItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  itemType: {
    type: String,
    enum: ["college", "course"],
    required: true,
  },
  // Store the full college/course JSON exactly as received — no schema filtering
  collegeData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  courseData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index — one user can save a college/course only once
savedItemSchema.index({ userId: 1, itemType: 1, "collegeData._id": 1 });
savedItemSchema.index({ userId: 1, itemType: 1, "courseData._id": 1 });

module.exports = mongoose.model("SavedItem", savedItemSchema);
