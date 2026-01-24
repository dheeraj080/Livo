import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import {
  ChevronLeftIcon,
  LoaderIcon,
  Trash2Icon,
  CheckIcon,
  ListTodoIcon, // Better icon for "Add Todo"
} from "lucide-react";

const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const titleRef = useRef(null);

  // 1. DATA FETCHING
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNote({ ...res.data, todos: res.data.todos || [] });
        setLastSynced(new Date());
      } catch (err) {
        toast.error("Note not found");
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  // 2. AUTO-SAVE LOGIC (The "Silent" Save)
  const handleSave = useCallback(
    async (isAutoSave = true) => {
      if (!note?.title.trim() || !hasUnsavedChanges || saving) return;
      try {
        await api.put(`/notes/${id}`, note);
        setHasUnsavedChanges(false);
        setLastSynced(new Date());
      } catch (err) {
        console.error("Auto-sync failed", err);
      } finally {
        setSaving(false);
      }
    },
    [id, note, hasUnsavedChanges, saving],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasUnsavedChanges) handleSave();
    }, 1500); // Faster sync for a "live" feel
    return () => clearTimeout(timer);
  }, [note, hasUnsavedChanges, handleSave]);

  const updateNoteState = (updates) => {
    setNote((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1c1c1e]">
        <LoaderIcon className="animate-spin size-6 text-[#d4a017]" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-[#e5e5e7] selection:bg-[#d4a017]/30 flex flex-col">
      {/* 1. MINIMALIST TOOLBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-[#1c1c1e]/70 border-b border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-1 text-[#d4a017] hover:opacity-70 transition-all"
          >
            <ChevronLeftIcon className="size-6 stroke-[2.5]" />
            <span className="text-lg font-medium">Notes</span>
          </button>

          <div className="flex items-center gap-2">
            {/* ADD TODO MOVED TO TOOLBAR */}
            <button
              onClick={() =>
                updateNoteState({
                  todos: [
                    ...note.todos,
                    { id: Date.now(), text: "", completed: false },
                  ],
                })
              }
              className="p-2 hover:bg-white/10 rounded-lg text-[#d4a017]"
              title="Add Checklist"
            >
              <ListTodoIcon className="size-5" />
            </button>

            <button
              onClick={async () => {
                if (window.confirm("Delete note?")) {
                  await api.delete(`/notes/${id}`);
                  navigate("/home");
                }
              }}
              className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-red-400"
            >
              <Trash2Icon className="size-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. MAIN EDITOR CANVAS */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 pt-12 pb-10">
        {/* TITLE */}
        <textarea
          ref={titleRef}
          rows="1"
          placeholder="Title"
          className="w-full text-4xl font-black bg-transparent border-none outline-none text-white placeholder:text-zinc-800 resize-none overflow-hidden mb-8 tracking-tight"
          value={note.title}
          onChange={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
            updateNoteState({ title: e.target.value });
          }}
        />

        {/* CHECKLIST */}
        {note.todos?.length > 0 && (
          <div className="space-y-3 mb-8">
            {note.todos.map((todo) => (
              <div key={todo.id} className="group flex items-center gap-3">
                <button
                  onClick={() =>
                    updateNoteState({
                      todos: note.todos.map((t) =>
                        t.id === todo.id
                          ? { ...t, completed: !t.completed }
                          : t,
                      ),
                    })
                  }
                  className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed ? "bg-[#d4a017] border-[#d4a017]" : "border-zinc-700 hover:border-zinc-500"}`}
                >
                  {todo.completed && (
                    <CheckIcon className="size-3 text-[#1c1c1e] stroke-[4]" />
                  )}
                </button>
                <input
                  type="text"
                  value={todo.text}
                  placeholder="Checklist item"
                  onChange={(e) =>
                    updateNoteState({
                      todos: note.todos.map((t) =>
                        t.id === todo.id ? { ...t, text: e.target.value } : t,
                      ),
                    })
                  }
                  className={`flex-1 bg-transparent border-none outline-none text-base ${todo.completed ? "text-zinc-600 line-through" : "text-zinc-300"}`}
                />
                <button
                  onClick={() =>
                    updateNoteState({
                      todos: note.todos.filter((t) => t.id !== todo.id),
                    })
                  }
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-opacity"
                >
                  <Trash2Icon className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CONTENT BODY */}
        <textarea
          placeholder="Start writing..."
          className="w-full bg-transparent border-none outline-none min-h-[400px] text-lg leading-relaxed text-zinc-300 placeholder:text-zinc-800 resize-none font-medium"
          value={note.content}
          onChange={(e) => updateNoteState({ content: e.target.value })}
        />
      </main>

      {/* 3. DATE MOVED TO BOTTOM (Native Status Bar Style) */}
      <footer className="py-6 border-t border-white/[0.03] bg-[#1c1c1e]">
        <div className="text-center space-y-1">
          <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
            {new Date(note.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at{" "}
            {new Date(note.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {saving && (
            <p className="text-[9px] font-black text-[#d4a017] uppercase tracking-widest animate-pulse">
              Updating Palace...
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default NoteDetailPage;
