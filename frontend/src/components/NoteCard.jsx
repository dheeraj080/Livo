import { Trash2Icon, ClockIcon } from "lucide-react";
import { Link } from "react-router";
import { formatDate } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";

const NoteCard = ({ note, setNotes }) => {
  const handleDelete = async (e, id) => {
    e.preventDefault();

    if (!window.confirm("Delete this note? This can't be undone.")) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note._id !== id));
      toast.success("Note deleted");
    } catch (error) {
      console.log("Error in handleDelete", error);
      toast.error("Failed to delete note");
    }
  };

  return (
    <Link
      to={`/note/${note._id}`}
      className="group relative block rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300 overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-blue-500/0 group-hover:from-violet-500/5 group-hover:to-blue-500/5 transition-all duration-300" />

      <div className="relative p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-slate-50 mb-3 line-clamp-2 group-hover:text-violet-300 transition-colors">
          {note.title}
        </h3>

        {/* Content preview */}
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4">
          {note.content || "No content yet..."}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ClockIcon className="size-3.5" />
            <span>{formatDate(new Date(note.createdAt))}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleDelete(e, note._id)}
              className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
              aria-label="Delete note"
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
};

export default NoteCard;
