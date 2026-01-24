import { ChevronLeftIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import api from "../lib/axios";

const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const titleInputRef = useRef(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() && !content.trim()) {
      navigate("/home");
      return;
    }

    setLoading(true);
    const finalTitle =
      title.trim() || content.split("\n")[0].substring(0, 35) || "New Note";

    try {
      await api.post("/notes", {
        title: finalTitle,
        content: content.trim(),
      });
      toast.success("Saved to Palace");
      navigate("/home");
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1c1c1e] text-zinc-900 dark:text-[#e5e5e7] flex flex-col transition-colors duration-500">
      {/* 1. ADAPTIVE TOOLBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/75 dark:bg-[#1c1c1e]/75 border-b border-zinc-200 dark:border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-1 text-[#d4a017] hover:opacity-70 transition-all"
          >
            <ChevronLeftIcon className="size-6 stroke-[2.5]" />
            <span className="text-lg font-medium">Notes</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="text-lg font-bold text-[#d4a017] disabled:opacity-30 transition-opacity"
          >
            {loading ? "Saving..." : "Done"}
          </button>
        </div>
      </nav>

      {/* 2. EDITOR CANVAS */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 pt-12 pb-10">
        <input
          ref={titleInputRef}
          type="text"
          placeholder="Title"
          className="w-full text-4xl font-black bg-transparent border-none outline-none text-zinc-900 dark:text-white placeholder:text-zinc-200 dark:placeholder:text-zinc-800 tracking-tight mb-6"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          ref={contentRef}
          placeholder="Start writing..."
          className="w-full bg-transparent border-none outline-none text-lg leading-relaxed text-zinc-800 dark:text-zinc-300 placeholder:text-zinc-200 dark:placeholder:text-zinc-800 resize-none font-medium overflow-hidden"
          value={content}
          onChange={handleContentChange}
          style={{ minHeight: "400px" }}
        />
      </main>

      {/* 3. ADAPTIVE FOOTER */}
      <footer className="sticky bottom-0 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-t border-zinc-100 dark:border-white/[0.03] pb-safe">
        <div className="max-w-3xl mx-auto px-6 h-14 flex flex-col items-center justify-center">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">
            {new Date().toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            at{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default CreatePage;
