import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// 1. Define the Base URL correctly
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// 2. Create the axios instance without syntax errors
const api = axios.create({
  baseURL: BACKEND_URL,
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
    // 3. Fix the hardcoded redirect to use the dynamic URL
    console.log("Redirecting to:", `${BACKEND_URL}/notes/google`);
    window.location.href = `${BACKEND_URL}/notes/google`;
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

export const useAuth = () => useContext(AuthContext);
