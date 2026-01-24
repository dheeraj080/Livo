import express from "express";
import passport from "passport";
import { 
  delete_note, 
  get_all_notes, 
  update_note, 
  create_note, 
  get_note_by_id,
  get_me // <--- Make sure to import this!
} from "../controllers/notes_controller.js";
import { protect } from "../middleware/protect.js";
import { signToken } from "../lib/authUtils.js";
import { logout_user } from "../controllers/notes_controller.js";

const router = express.Router();

// --- AUTH ROUTES ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = signToken(req.user._id); 
    
    // Cookie settings for Production (Secure & Cross-Site)
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: true,      // Required for sameSite: 'none'
      sameSite: 'none',  // Required for cross-domain cookies
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    const targetUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    console.log("Redirecting user to:", targetUrl); // Check Render logs for this!
    res.redirect(targetUrl); 
  }
);

// --- PROTECTED ROUTES ---
router.use(protect);

router.get("/me", (req, res) => {
    res.status(200).json(req.user); 
});

router.get("/", get_all_notes);
router.get("/:id", get_note_by_id);
router.post("/", create_note); // Removed the duplicate one from before
router.put("/:id", update_note);
router.delete("/:id", delete_note);

router.post("/logout", logout_user);

export default router;