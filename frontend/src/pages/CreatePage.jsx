import { ChevronLeftIcon, SquarePenIcon, ListTodoIcon } from "lucide-react";
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

  // Auto-resize textarea logic
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
      toast.success("Saved");
      navigate("/home");
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-[#e5e5e7] flex flex-col">
      {/* 1. NATIVE-STYLE TOOLBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-[#1c1c1e]/75 border-b border-white/[0.05]">
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
          className="w-full text-4xl font-black bg-transparent border-none outline-none text-white placeholder:text-zinc-800 tracking-tight mb-6"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          ref={contentRef}
          placeholder="Start writing..."
          className="w-full bg-transparent border-none outline-none text-lg leading-relaxed text-zinc-300 placeholder:text-zinc-800 resize-none font-medium overflow-hidden"
          value={content}
          onChange={handleContentChange}
          style={{ minHeight: "400px" }}
        />
      </main>

      {/* 3. THE "APPLE" FOOTER (Date & Actions) */}
      <footer className="sticky bottom-0 bg-[#1c1c1e]/80 backdrop-blur-xl border-t border-white/[0.03] pb-safe">
        <div className="max-w-3xl mx-auto px-6 h-14 flex flex-col items-center justify-center">
          {/* Centered Date Info */}
          <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2">
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

          {/* Quick Accessory Row */}
          {/*
          <div className="w-full flex justify-between items-center text-[#d4a017]">
            <div className="flex gap-6">
              <ListTodoIcon className="size-5 cursor-pointer hover:opacity-70" />
              <SquarePenIcon className="size-5 cursor-pointer hover:opacity-70" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {content.length} chars
            </span>
          </div>
              */}
        </div>
      </footer>
    </div>
  );
};

export default CreatePage;
