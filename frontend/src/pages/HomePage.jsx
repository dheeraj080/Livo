import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Swapped from useAuth0
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import NotesNotFound from "../components/NotesNotFound";

const HomePage = () => {
  // Use your custom auth context and the pre-configured axios 'api' instance
  const { user, api } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We don't need to check !user here because ProtectedRoute
    // ensures only logged-in users reach this component.
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes");
        setNotes(res.data);
      } catch (error) {
        toast.error("Mind Palace sync failed");
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [api]); // Re-run if the api instance changes

  return (
    <div className="min-h-screen pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight">
            Your Collection
          </h1>
          <p className="text-slate-400 text-sm font-light">
            {notes.length} {notes.length === 1 ? "thought" : "thoughts"}{" "}
            archived for {user?.displayName}
          </p>
        </div>

        {loading ? (
          // SKELETON LOADING STATE
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-white/5 rounded-3xl animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <NotesNotFound />
        ) : (
          // THE GRID
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} setNotes={setNotes} />
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
