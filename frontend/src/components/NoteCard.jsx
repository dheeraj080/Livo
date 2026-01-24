import { Trash2Icon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";

const NoteCard = ({ note, setNotes }) => {
  const navigate = useNavigate();

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success("Moved to Trash");
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Could not delete");
    }
  };

  return (
    <Link
      to={`/note/${note._id}`}
      className="group relative block aspect-square md:aspect-auto md:h-48 rounded-[2rem] bg-white dark:bg-[#1c1c1e] border border-zinc-200 dark:border-white/[0.05] hover:bg-zinc-50 dark:hover:bg-[#2c2c2e] transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1"
    >
      {/* 1. THE TEXTURE LAYER (Subtle noise adapts to theme) */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply dark:mix-blend-soft-light" />

      <div className="relative h-full p-6 flex flex-col">
        {/* 2. HEADER: TITLE & DELETE */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate pr-4">
            {note.title || "New Note"}
          </h3>
          <button
            onClick={(e) => handleDelete(e, note._id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-all"
          >
            <Trash2Icon className="size-4" />
          </button>
        </div>

        {/* 3. BODY: CONTENT PREVIEW */}
        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-snug line-clamp-3 font-medium mb-4">
          {note.content || "No additional text"}
        </p>

        {/* 4. FOOTER: DATE & ACCENT */}
        <div className="mt-auto flex items-center gap-3">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-tight">
            {new Date(note.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>

          {/* Subtle separator dot */}
          <div className="size-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />

          {/* Gold accent dot */}
          {note.todos?.length > 0 && (
            <div className="size-2 rounded-full bg-[#d4a017] shadow-[0_0_10px_rgba(212,160,23,0.4)]" />
          )}
        </div>
      </div>

      {/* 5. INTERACTIVE INDICATOR */}
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-[#d4a017] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
    </Link>
  );
};

export default NoteCard;
