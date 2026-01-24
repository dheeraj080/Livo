import mongoose from "mongoose";

const note_schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        // Changed required to false so you can have a "tasks only" note
        required: false, 
    },
    // Changed "task" to "todos" to match your frontend state
    todos: [
        {
            id: { type: Number }, // Matches the Date.now() we used in React
            text: { type: String },
            completed: { type: Boolean, default: false }
        }
    ],
    // Keep this if you want a global "completed" status for the whole note
    completed: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

const Note = mongoose.model("Note", note_schema);

export default Note;