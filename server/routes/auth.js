const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/sendEmail");

const router = express.Router();

// Register — sends verification email, does NOT auto-login
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // If user exists but is NOT verified, allow resending
        if (!existingUser.isEmailVerified) {
          const verifyToken = existingUser.createEmailVerificationToken();
          await existingUser.save({ validateBeforeSave: false });
          try {
            await sendVerificationEmail(email, existingUser.name, verifyToken);
          } catch (emailErr) {
            console.error("Email send error:", emailErr);
          }
          return res.status(400).json({
            message:
              "Account exists but is not verified. We sent a new verification email.",
            needsVerification: true,
          });
        }
        return res
          .status(400)
          .json({ message: "User already exists with this email" });
      }

      // Create new user (not verified yet)
      const user = new User({ name, email, password, isEmailVerified: false });
      const verifyToken = user.createEmailVerificationToken();
      await user.save();

      // Send verification email
      try {
        await sendVerificationEmail(email, name, verifyToken);
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
        // Still return success — user is created, they can request resend later
      }

      res.status(201).json({
        message:
          "Registration successful! Please check your email to verify your account.",
        needsVerification: true,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  },
);

// Verify email
router.get("/verify-email/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Verification link is invalid or has expired." });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Generate JWT so user is auto-logged-in after verification
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Email verified successfully! You can now login.",
      verified: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Server error during email verification" });
  }
});

// Resend verification email
router.post(
  "/resend-verification",
  [body("email").isEmail().withMessage("Please provide a valid email")],
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ message: "No account found with this email." });
      }

      if (user.isEmailVerified) {
        return res
          .status(400)
          .json({ message: "This email is already verified." });
      }

      const verifyToken = user.createEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      try {
        await sendVerificationEmail(email, user.name, verifyToken);
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
        return res
          .status(500)
          .json({
            message: "Failed to send verification email. Please try again.",
          });
      }

      res.json({
        message: "Verification email sent! Please check your inbox.",
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Login — only if email is verified
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check email verification
      if (!user.isEmailVerified) {
        return res.status(403).json({
          message:
            "Please verify your email before logging in. Check your inbox for the verification link.",
          needsVerification: true,
          email: user.email,
        });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  },
);

// Forgot password — send reset link
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Please provide a valid email")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        // Don't reveal if email exists
        return res.json({
          message:
            "If an account with that email exists, we sent a password reset link.",
        });
      }

      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      try {
        await sendPasswordResetEmail(email, user.name, resetToken);
      } catch (emailErr) {
        console.error("Password reset email error:", emailErr);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return res
          .status(500)
          .json({ message: "Failed to send reset email. Please try again." });
      }

      res.json({
        message:
          "If an account with that email exists, we sent a password reset link.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Reset password
router.post(
  "/reset-password/:token",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Reset link is invalid or has expired." });
      }

      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      // Also verify email if not already verified (since they proved email ownership)
      user.isEmailVerified = true;
      await user.save();

      // Auto-login
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        message: "Password reset successful!",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Server error during password reset" });
    }
  },
);

// Verify token and get user info
router.get("/verify", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ message: "Server error during token verification" });
  }
});

module.exports = router;
