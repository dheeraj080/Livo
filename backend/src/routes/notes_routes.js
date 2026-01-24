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
    
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173"); 
  }
);

// --- PROTECTED ROUTES ---
router.use(protect);
router.post("/", create_note);

// 1. SPECIFIC ROUTES FIRST
router.get("/me", (req, res) => {
    // You can define it inline here or import get_me from your controller
    res.status(200).json(req.user); 
});

// 2. GENERAL ROUTES AFTER
router.get("/", get_all_notes);
router.get("/:id", get_note_by_id); // Now 'me' won't trigger this!
router.post("/", create_note);
router.put("/:id", update_note);
router.delete("/:id", delete_note);

router.post("/logout", logout_user);

export default router;