import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 1. Wrap with BrowserRouter for routing */}
    <BrowserRouter>
      {/* 2. Wrap with AuthProvider for user state */}
      <AuthProvider>
        <App />
        <Toaster position="bottom-right" />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
