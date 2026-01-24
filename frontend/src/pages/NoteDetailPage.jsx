import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import {
  ChevronLeftIcon,
  LoaderIcon,
  Trash2Icon,
  CheckIcon,
  ListTodoIcon,
  EraserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const titleRef = useRef(null);
  const todoRefs = useRef([]); // Critical for focus management

  // 1. DATA FETCHING
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNote({ ...res.data, todos: res.data.todos || [] });
      } catch (err) {
        toast.error("Note not found");
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  // 2. AUTO-SAVE LOGIC
  const handleSave = useCallback(async () => {
    if (!note?.title.trim() || !hasUnsavedChanges || saving) return;
    setSaving(true);
    try {
      await api.put(`/notes/${id}`, note);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Auto-sync failed", err);
    } finally {
      setSaving(false);
    }
  }, [id, note, hasUnsavedChanges, saving]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasUnsavedChanges) handleSave();
    }, 1500);
    return () => clearTimeout(timer);
  }, [note, hasUnsavedChanges, handleSave]);

  const updateNoteState = (updates) => {
    setNote((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1c1c1e] transition-colors duration-500">
        <LoaderIcon className="animate-spin size-6 text-[#d4a017]" />
      </div>
    );

  const hasCompletedTodos = note.todos.some((t) => t.completed);

  return (
    <div className="min-h-screen bg-white dark:bg-[#1c1c1e] text-zinc-900 dark:text-[#e5e5e7] selection:bg-[#d4a017]/30 flex flex-col transition-colors duration-500">
      {/* 1. ADAPTIVE TOOLBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 dark:bg-[#1c1c1e]/70 border-b border-zinc-200 dark:border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-1 text-[#d4a017] hover:opacity-70 transition-all"
          >
            <ChevronLeftIcon className="size-6 stroke-[2.5]" />
            <span className="text-lg font-medium">Notes</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Quick Clear Utility */}
            <AnimatePresence>
              {hasCompletedTodos && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() =>
                    updateNoteState({
                      todos: note.todos.filter((t) => !t.completed),
                    })
                  }
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg text-zinc-400 hover:text-[#d4a017] transition-colors"
                  title="Clear Completed"
                >
                  <EraserIcon className="size-5" />
                </motion.button>
              )}
            </AnimatePresence>

            <button
              onClick={() => {
                const newTodo = { id: Date.now(), text: "", completed: false };
                updateNoteState({ todos: [...note.todos, newTodo] });
                setTimeout(
                  () => todoRefs.current[note.todos.length]?.focus(),
                  0,
                );
              }}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg text-[#d4a017]"
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
              className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg text-zinc-400 hover:text-red-500"
            >
              <Trash2Icon className="size-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. MAIN EDITOR CANVAS */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 pt-12 pb-10">
        <textarea
          ref={titleRef}
          rows="1"
          placeholder="Title"
          className="w-full text-4xl font-black bg-transparent border-none outline-none text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-800 resize-none overflow-hidden mb-8 tracking-tight"
          value={note.title}
          onChange={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
            updateNoteState({ title: e.target.value });
          }}
        />

        {/* CHECKLIST SECTION */}
        <div className="mb-8 space-y-1">
          <AnimatePresence mode="popLayout">
            {note.todos.map((todo, index) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2, ease: "circOut" }}
                className="group flex items-center gap-3 overflow-hidden py-1"
              >
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
                  className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed
                      ? "bg-[#d4a017] border-[#d4a017]"
                      : "border-zinc-300 dark:border-zinc-700 hover:border-[#d4a017]"
                  }`}
                >
                  {todo.completed && (
                    <CheckIcon className="size-3 text-white dark:text-[#1c1c1e] stroke-[4]" />
                  )}
                </button>

                <input
                  type="text"
                  ref={(el) => (todoRefs.current[index] = el)}
                  value={todo.text}
                  placeholder="List item"
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && todo.text === "") {
                      e.preventDefault();
                      const newTodos = note.todos.filter(
                        (t) => t.id !== todo.id,
                      );
                      updateNoteState({ todos: newTodos });
                      setTimeout(() => todoRefs.current[index - 1]?.focus(), 0);
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const newTodo = {
                        id: Date.now(),
                        text: "",
                        completed: false,
                      };
                      const newTodos = [...note.todos];
                      newTodos.splice(index + 1, 0, newTodo);
                      updateNoteState({ todos: newTodos });
                      setTimeout(() => todoRefs.current[index + 1]?.focus(), 0);
                    }
                  }}
                  onChange={(e) =>
                    updateNoteState({
                      todos: note.todos.map((t) =>
                        t.id === todo.id ? { ...t, text: e.target.value } : t,
                      ),
                    })
                  }
                  className={`flex-1 bg-transparent border-none outline-none text-base transition-colors ${
                    todo.completed
                      ? "text-zinc-400 line-through decoration-zinc-500/50"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                />

                <button
                  onClick={() =>
                    updateNoteState({
                      todos: note.todos.filter((t) => t.id !== todo.id),
                    })
                  }
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-all active:scale-90"
                >
                  <Trash2Icon className="size-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CONTENT BODY */}
        <textarea
          placeholder="Start writing..."
          className="w-full bg-transparent border-none outline-none min-h-[400px] text-lg leading-relaxed text-zinc-800 dark:text-zinc-300 placeholder:text-zinc-200 dark:placeholder:text-zinc-800 resize-none font-medium"
          value={note.content}
          onChange={(e) => updateNoteState({ content: e.target.value })}
        />
      </main>

      {/* 3. STATUS BAR */}
      <footer className="py-6 border-t border-zinc-100 dark:border-white/[0.03] bg-white dark:bg-[#1c1c1e]">
        <div className="text-center space-y-1">
          <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">
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
              Syncing...
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default NoteDetailPage;
