import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Create an axios instance that always sends cookies
const api = axios.create({
  // Ensure your Render environment variable is VITE_API_URL
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await api.get("/notes/me");
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = () => {
    // FIX: Dynamic URL for production
    const backendUrl =
      import.meta.env.VITE_API_URL || "http://localhost:5001/api";
    window.location.href = `${backendUrl}/notes/google`;
  };

  const logout = async () => {
    try {
      await api.post("/notes/logout");
      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, api }}>
      {children}
    </AuthContext.Provider>
  );
};
