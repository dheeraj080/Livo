import mongoose from "mongoose";

const note_schema = new mongoose.Schema({
    // THE AUTH FIELD (Updated for custom OAuth)
    authorId: {
        type: mongoose.Schema.Types.ObjectId, // Connects to the User's MongoDB ID
        ref: "User",                          // Links to your User model
        required: true,
        index: true, 
    },
    title: {
        type: String,
        required: true,
        trim: true, // Prevents accidental empty spaces at start/end
    },
    content: {
        type: String,
        required: false, 
    },
    todos: [
        {
            id: { type: Number }, 
            text: { type: String, trim: true },
            completed: { type: Boolean, default: false }
        }
    ],
    completed: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

const Note = mongoose.model("Note", note_schema);

export default Note;