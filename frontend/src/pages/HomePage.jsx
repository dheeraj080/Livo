import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // Import theme hook
import { motion, AnimatePresence } from "framer-motion";
import { SearchIcon } from "lucide-react";
import { useNavigate } from "react-router";

import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import NotesNotFound from "../components/NotesNotFound";

const HomePage = () => {
  const { user, api } = useAuth();
  const { theme } = useTheme(); // Access the current theme
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes");
        setNotes(res.data);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [api]);

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#0d0d0d] text-[#1d1d1f] dark:text-[#e5e5e7] selection:bg-[#d4a017]/30 transition-colors duration-500">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-32">
        {/* APPLE STYLE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
              Notes
            </h1>
            <p className="text-zinc-500 font-medium tracking-wide">
              {notes.length} {notes.length === 1 ? "Note" : "Notes"} from{" "}
              {user?.displayName?.split(" ")[0] || "your Palace"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* SEARCH BAR - iOS Style */}
            <div className="relative group w-full md:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-[#d4a017] transition-colors" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-200/50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-white/5 py-2 pl-10 pr-4 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#d4a017]/50 transition-all placeholder:text-zinc-500"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-44 bg-white dark:bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-200 dark:border-white/5"
              />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <NotesNotFound />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <NoteCard key={note._id} note={note} setNotes={setNotes} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
