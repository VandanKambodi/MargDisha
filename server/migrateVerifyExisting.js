// Run once: marks all existing users as email-verified so they aren't locked out
// Usage: cd server && node migrateVerifyExisting.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const result = await User.updateMany(
      { isEmailVerified: { $ne: true } },
      { $set: { isEmailVerified: true } },
    );

    console.log(
      `✅ Marked ${result.modifiedCount} existing users as email-verified.`,
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
