import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// 1. Kick off the Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 2. Google redirects back here
router.get("/google/callback", 
  passport.authenticate("google", { session: false }), 
  (req, res) => {
    // Create our own JWT using the user's ID
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Send token in an HTTP-Only cookie (Most secure way)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:5173"); // Back to React
  }
);

export default router;