import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser"; // Needed for JWT cookies
import passport from "passport"; // Needed for OAuth

import notes_routes from "./routes/notes_routes.js";
import { connectDB } from "./config/db.js";
import rate_limiter from "./middleware/rate_limiter.js";
import "./config/passport.js"; // Import your passport configuration logic

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

app.set("trust proxy", 1);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

// 1. CORS Configuration (Crucial for Cookies)
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true, // Required for JWT cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);
// 2. Core Middleware
app.use(cookieParser()); // Parses the cookie header for req.cookies
app.use(express.json());
app.use(passport.initialize()); // Initializes Passport for OAuth
app.use(rate_limiter);

// 3. Debugging Middleware (Fixed the URL typo)
app.use((req, res, next) => {
  console.log(`Req method ${req.method} & Req URL ${req.originalUrl}`);
  next();
});

// 4. Routes
app.use("/api/notes", notes_routes);

// C. REFINED PRODUCTION PATHING
if (process.env.NODE_ENV === "production") {
  // Use ".." to step OUT of the backend folder and into the frontend folder
  const frontendPath = path.join(__dirname, "..", "frontend", "dist");
  
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      // Use path.resolve to ensure we have an absolute path for the file system
      res.sendFile(path.resolve(frontendPath, "index.html"));
    }
  });
}

// 6. Database & Server Start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on PORT ${PORT}`);
  });
});