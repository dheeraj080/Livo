import { Routes, Route, useLocation, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "./context/AuthContext"; // Import your hook

import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import NoteDetailPage from "./pages/NoteDetailPage";
import LandingPage from "./pages/LandingPage"; // You'll create this next
import ProtectedRoute from "./components/ProtectedRoute"; // The gatekeeper

const App = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  // Prevent "flicker" while the app checks if the user has a valid cookie
  if (loading) return null;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-slate-50 selection:bg-violet-500/20">
      {/* ... Your fixed background divs and orbs ... */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* PUBLIC ROUTE */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/home" />
              ) : (
                <PageWrapper>
                  <LandingPage />
                </PageWrapper>
              )
            }
          />

          {/* PROTECTED ROUTES */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <HomePage />
                </PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <CreatePage />
                </PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/note/:id"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <NoteDetailPage />
                </PageWrapper>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "rgba(15, 15, 25, 0.85)",
            color: "#f1f5f9",
            border: "1px solid rgba(139, 92, 246, 0.15)",
            backdropFilter: "blur(16px)",
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 0 40px -10px rgba(139, 92, 246, 0.1)",
          },
          success: {
            iconTheme: {
              primary: "#8b5cf6",
              secondary: "#ffffff",
            },
            style: {
              border: "1px solid rgba(139, 92, 246, 0.25)",
            },
          },
          error: {
            iconTheme: {
              primary: "#f43f5e",
              secondary: "#ffffff",
            },
            style: {
              border: "1px solid rgba(244, 63, 94, 0.25)",
            },
          },
        }}
      />
    </div>
  );
};

// PAGE WRAPPER WITH REFINED ANIMATION
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 1.02, y: -10 }}
    transition={{
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    }}
  >
    {children}
  </motion.div>
);

export default App;
