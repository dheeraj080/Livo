import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  LoaderIcon,
  Trash2Icon,
  PlusIcon,
  CheckIcon,
  SaveIcon,
  SparklesIcon,
} from "lucide-react";

const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const totalTasks = note?.todos?.length || 0;
  const completedTasks = note?.todos?.filter((t) => t.completed).length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNote({ ...res.data, todos: res.data.todos || [] });
      } catch (error) {
        toast.error("Note not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  const handleSave = useCallback(
    async (isAutoSave = false) => {
      if (!note?.title.trim() || !hasUnsavedChanges || saving) return;

      if (!isAutoSave) setSaving(true);

      try {
        await api.put(`/notes/${id}`, note);
        setHasUnsavedChanges(false);
        if (!isAutoSave) toast.success("Saved");
      } catch (error) {
        if (!isAutoSave) toast.error("Save failed");
      } finally {
        setSaving(false);
      }
    },
    [id, note, hasUnsavedChanges, saving],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasUnsavedChanges) handleSave(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [note, hasUnsavedChanges, handleSave]);

  const updateNoteState = (updates) => {
    setNote((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const addTodo = () => {
    const newTodo = { id: Date.now(), text: "", completed: false };
    updateNoteState({ todos: [...note.todos, newTodo] });
  };

  const updateTodo = (todoId, updates) => {
    const newTodos = note.todos.map((t) =>
      t.id === todoId ? { ...t, ...updates } : t,
    );
    updateNoteState({ todos: newTodos });
  };

  const deleteTodo = (todoId) => {
    updateNoteState({ todos: note.todos.filter((t) => t.id !== todoId) });
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this note? This can't be undone.")) return;
    try {
      await api.delete(`/notes/${id}`);
      toast.success("Note deleted");
      navigate("/");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoaderIcon className="animate-spin size-10 text-violet-400" />
          <span className="text-sm text-slate-400 animate-pulse">
            Loading...
          </span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen pb-20 selection:bg-violet-500/20">
      {/* Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-violet-500/10">
        <div className="container mx-auto px-6 py-4 max-w-4xl flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors"
          >
            <ArrowLeftIcon className="size-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium hidden sm:inline">Notes</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className="hidden md:flex items-center gap-2">
              {saving && (
                <span className="text-xs text-slate-500">Saving...</span>
              )}
              {!saving && hasUnsavedChanges && (
                <div className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs text-slate-500">Unsaved</span>
                </div>
              )}
              {!saving && !hasUnsavedChanges && (
                <div className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-500">Saved</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Delete note"
              >
                <Trash2Icon className="size-4" />
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={!hasUnsavedChanges || saving}
                className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/20"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Save
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <SaveIcon className="size-4" />
                    Save
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-12">
          {/* Title */}
          <div className="space-y-6">
            <input
              type="text"
              className="w-full text-4xl sm:text-5xl font-bold bg-transparent border-none outline-none text-slate-50 placeholder:text-slate-700"
              value={note.title}
              placeholder="Untitled"
              onChange={(e) => updateNoteState({ title: e.target.value })}
            />

            {/* Progress */}
            {totalTasks > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-violet-500/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-violet-400">
                    <SparklesIcon
                      className={`size-4 ${progress === 100 ? "animate-pulse" : ""}`}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Progress
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {completedTasks} of {totalTasks} complete
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      progress === 100
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                        : "bg-gradient-to-r from-violet-500 to-blue-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            {note.todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-start gap-3 group p-4 rounded-xl bg-gradient-to-br from-slate-800/20 to-slate-900/20 hover:from-slate-800/40 hover:to-slate-900/40 border border-transparent hover:border-violet-500/20 transition-all"
              >
                <button
                  onClick={() =>
                    updateTodo(todo.id, { completed: !todo.completed })
                  }
                  className={`mt-0.5 size-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    todo.completed
                      ? "bg-violet-600 border-violet-600"
                      : "border-slate-600 hover:border-violet-500"
                  }`}
                >
                  {todo.completed && (
                    <CheckIcon className="size-3 text-white" />
                  )}
                </button>
                <input
                  type="text"
                  className={`flex-1 bg-transparent border-none outline-none text-slate-300 transition-all ${
                    todo.completed ? "line-through opacity-40" : ""
                  }`}
                  value={todo.text}
                  placeholder="New task..."
                  onChange={(e) =>
                    updateTodo(todo.id, { text: e.target.value })
                  }
                />
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                >
                  <Trash2Icon className="size-4" />
                </button>
              </div>
            ))}

            <button
              onClick={addTodo}
              className="flex items-center gap-3 p-4 w-full rounded-xl border-2 border-dashed border-slate-700 hover:border-violet-500/50 text-slate-500 hover:text-violet-400 transition-all group"
            >
              <div className="size-5 rounded-md border-2 border-dashed border-current flex items-center justify-center group-hover:rotate-90 transition-transform">
                <PlusIcon className="size-3" />
              </div>
              <span className="text-sm font-medium">Add task</span>
            </button>
          </div>

          {/* Content */}
          <div className="pt-6 border-t border-slate-800">
            <textarea
              className="w-full bg-transparent border-none outline-none min-h-[400px] text-base leading-relaxed text-slate-300 placeholder:text-slate-700 resize-none"
              value={note.content}
              placeholder="Write your thoughts..."
              onChange={(e) => updateNoteState({ content: e.target.value })}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoteDetailPage;
