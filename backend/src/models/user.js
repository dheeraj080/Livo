import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    displayName: String,
    avatar: String,
    
    // Social IDs (OAuth Providers)
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },

    // Role-based access (Optional)
    role: { type: String, default: "user" }
}, { timestamps: true });

// 'sparse: true' allows multiple users to have 'null' for a specific social ID
// while still ensuring that if an ID exists, it must be unique.

const User = mongoose.model("User", userSchema);
export default User;