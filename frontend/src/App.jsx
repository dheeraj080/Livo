import { Routes, Route, useLocation } from "react-router";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import NoteDetailPage from "./pages/NoteDetailPage";

const App = () => {
  const location = useLocation();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-slate-50 selection:bg-violet-500/20">
      {/* 1. SOPHISTICATED DARK BASE */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a0f]" />

      {/* 2. ELEGANT MULTI-LAYER GRADIENTS */}
      <div className="fixed inset-0 -z-10 h-full w-full">
        {/* Primary violet glow */}
        <div className="absolute inset-0 [background:radial-gradient(circle_at_30%_-10%,rgba(139,92,246,0.12),transparent_50%)]" />
        {/* Secondary blue accent */}
        <div className="absolute inset-0 [background:radial-gradient(circle_at_70%_110%,rgba(59,130,246,0.08),transparent_60%)]" />
        {/* Subtle warm accent */}
        <div className="absolute inset-0 [background:radial-gradient(circle_at_90%_30%,rgba(236,72,153,0.04),transparent_70%)]" />
      </div>

      {/* 3. PREMIUM GRAIN TEXTURE */}
      <div className="fixed inset-0 -z-10 opacity-[0.015] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* 4. FLOATING AMBIENT ORBS */}
      <div className="fixed top-[-15%] left-[-5%] -z-10 h-[700px] w-[700px] rounded-full bg-violet-600/[0.08] blur-[140px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="fixed bottom-[-15%] right-[-8%] -z-10 h-[500px] w-[500px] rounded-full bg-blue-600/[0.06] blur-[120px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
      <div className="fixed top-[40%] right-[5%] -z-10 h-[300px] w-[300px] rounded-full bg-pink-600/[0.03] blur-[100px] animate-[pulse_12s_ease-in-out_infinite_4s]" />

      {/* 5. SUBTLE VIGNETTE EFFECT */}
      <div className="fixed inset-0 -z-10 [background:radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
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
