import { Routes, Route, useLocation, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext"; // 1. Import useTheme

import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import NoteDetailPage from "./pages/NoteDetailPage";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MindMap from "./pages/MindMap";

const App = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const { theme } = useTheme(); // 2. Access current theme

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#0f0f19] transition-colors duration-500">
        <span className="loading loading-ring loading-lg text-[#d4a017]"></span>
      </div>
    );

  return (
    // 3. Update the main wrapper to use dynamic background colors
    <div className="relative min-h-screen w-full bg-[#f5f5f7] dark:bg-[#0b0b14] text-zinc-900 dark:text-slate-50 selection:bg-[#d4a017]/20 transition-colors duration-500">
      {/* 4. DYNAMIC BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* These blobs now change color based on the theme */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#d4a017]/5 dark:bg-violet-600/10 blur-[120px] transition-colors duration-700" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-400/10 dark:indigo-600/10 blur-[120px] transition-colors duration-700" />
      </div>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/home" replace />
              ) : (
                <PageWrapper>
                  <LandingPage />
                </PageWrapper>
              )
            }
          />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/home"
              element={
                <PageWrapper>
                  <HomePage />
                </PageWrapper>
              }
            />
            <Route
              path="/canvas"
              element={
                <PageWrapper>
                  <MindMap />
                </PageWrapper>
              }
            />{" "}
            {/* New Route */}
            <Route
              path="/home"
              element={
                <PageWrapper>
                  <HomePage />
                </PageWrapper>
              }
            />
            <Route
              path="/create"
              element={
                <PageWrapper>
                  <CreatePage />
                </PageWrapper>
              }
            />
            <Route
              path="/note/:id"
              element={
                <PageWrapper>
                  <NoteDetailPage />
                </PageWrapper>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <CustomToaster theme={theme} />
    </div>
  );
};

// 5. Make the Toaster theme-aware
const CustomToaster = ({ theme }) => (
  <Toaster
    position="bottom-right"
    toastOptions={{
      duration: 3500,
      className:
        "backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-2xl rounded-2xl p-4 text-sm font-medium transition-all",
      style: {
        background:
          theme === "black"
            ? "rgba(15, 15, 25, 0.8)"
            : "rgba(255, 255, 255, 0.8)",
        color: theme === "black" ? "#f1f5f9" : "#1d1d1f",
      },
      success: { iconTheme: { primary: "#d4a017", secondary: "#fff" } },
    }}
  />
);

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="relative z-10 w-full"
  >
    {children}
  </motion.div>
);

export default App;
