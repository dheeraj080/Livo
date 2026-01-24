import mongoose from "mongoose"; // CRITICAL: Added this import
import Note from "../models/note.js";
import User from "../models/User.js"; // Needed for the get_me function

// Helper to get the ID attached by your 'protect' middleware
const getUserId = (req) => req.user?.id;

// NEW: Controller to handle the /me route
export const get_me = async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId).select("-googleId"); 
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const get_all_notes = async (req, res) => {
  try {
    const userId = getUserId(req);
    const notes = await Note.find({ authorId: userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error("Error in get_all_notes:", error);
    res.status(500).json({ message: "Error fetching notes" });
  }
};

export async function get_note_by_id(req, res) {
  // Check validity before querying DB to avoid CastErrors
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid Note ID format" });
  }
  
  try {
    const userId = getUserId(req);
    const note = await Note.findOne({ _id: req.params.id, authorId: userId });
    
    if (!note) return res.status(404).json({ message: "Note not found or unauthorized" });
    res.json(note);
  } catch (error) {
    console.error("Error in get_note_by_id:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function create_note(req, res) {
  try {
    const { title, content, todos } = req.body;
    const userId = req.user?.id; // Or use your getUserId(req) helper

    // DEBUG: Check your terminal to see if this is undefined
    console.log("Creating note for User ID:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Auth failed: No user ID found" });
    }

    const note = new Note({ 
      title, 
      content, 
      todos: todos || [],
      authorId: userId // Ensure this matches your Schema (ObjectId)
    });

    const saved_note = await note.save();
    res.status(201).json(saved_note);
  } catch (error) {
    console.error("Error in create_note:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}

export async function update_note(req, res) {
  try {
    const { title, content, todos } = req.body;
    const userId = getUserId(req);

    const updated_note = await Note.findOneAndUpdate(
      { _id: req.params.id, authorId: userId },
      { title, content, todos },
      { new: true, runValidators: true }
    );

    if (!updated_note) return res.status(404).json({ message: "Note not found or unauthorized" });

    res.status(200).json(updated_note);
  } catch (error) {
    console.error("Error in update_note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function delete_note(req, res) {
  try {
    const userId = getUserId(req);
    const deleted_note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      authorId: userId 
    });
    
    if (!deleted_note) return res.status(404).json({ message: "Note not found or unauthorized" });
    res.status(200).json({ message: "Note Deleted" });
  } catch (error) {
    console.error("Error in delete_note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const logout_user = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(200).json({ message: "Successfully logged out from the Palace" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};