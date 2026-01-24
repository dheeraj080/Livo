import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Create an axios instance that always sends cookies
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in via cookie
    const checkUser = async () => {
      try {
        const res = await api.get("/notes/me"); // We'll create this route next
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
    // Redirect the entire window to the backend Google route
    window.location.href = "http://localhost:5001/api/notes/google";
  };

  const logout = async () => {
    try {
      await api.post("/notes/logout");
      setUser(null);
      // Optional: Force a redirect to the home/landing page
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
