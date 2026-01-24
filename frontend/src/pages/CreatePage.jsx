import { ArrowLeftIcon, SaveIcon, SparklesIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import api from "../lib/axios";

const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const titleInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Add a title first");
      titleInputRef.current?.focus();
      return;
    }

    if (!content.trim()) {
      toast.error("Add some content");
      return;
    }

    setLoading(true);
    try {
      await api.post("/notes", {
        title: title.trim(),
        content: content.trim(),
      });

      toast.success("Note created");
      navigate("/");
    } catch (error) {
      console.log("Error creating note", error);
      if (error.response?.status === 429) {
        toast.error("Slow down! Too many notes");
      } else {
        toast.error("Failed to create note");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (window.confirm("Discard unsaved changes?")) {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  const isFormValid = title.trim() && content.trim();

  return (
    <div className="min-h-screen pb-20 selection:bg-violet-500/20">
      {/* Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-violet-500/10">
        <div className="container mx-auto px-6 py-4 max-w-4xl flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="group flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors"
          >
            <ArrowLeftIcon className="size-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium hidden sm:inline">Cancel</span>
          </button>

          <div className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-violet-400 animate-pulse" />
            <h1 className="text-lg font-bold text-slate-200 hidden sm:block">
              New Note
            </h1>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <SaveIcon className="size-4" />
                Create
              </span>
            )}
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Welcome Banner */}
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-violet-500/20 rounded-xl backdrop-blur-sm">
              <SparklesIcon className="size-6 text-violet-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-1">
                Create Your Note
              </h2>
              <p className="text-sm text-slate-400">
                Start with a clear title, then capture your thoughts below.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-10">
          {/* Title */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center justify-between">
              <span>Title</span>
              <span
                className={`${title.length > 100 ? "text-amber-400" : "text-slate-600"}`}
              >
                {title.length}/100
              </span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              placeholder="Untitled"
              className="w-full text-4xl sm:text-5xl font-bold bg-transparent border-none outline-none text-slate-50 placeholder:text-slate-700"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

          {/* Content */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center justify-between">
              <span>Content</span>
              <span className="text-slate-600">
                {content.length} characters
              </span>
            </label>
            <textarea
              placeholder="Start writing..."
              className="w-full bg-transparent border-none outline-none min-h-[400px] text-base leading-relaxed text-slate-300 placeholder:text-slate-700 resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex flex-col sm:hidden gap-3 mt-10">
          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Note...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <SaveIcon className="size-5" />
                Create Note
              </span>
            )}
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-3 text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Tips */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-violet-500/10">
            <h3 className="font-bold text-sm mb-1 text-slate-300 flex items-center gap-2">
              💡 Quick Tip
            </h3>
            <p className="text-xs text-slate-500">
              Clear titles help you find notes faster.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-violet-500/10">
            <h3 className="font-bold text-sm mb-1 text-slate-300 flex items-center gap-2">
              ✨ Pro Tip
            </h3>
            <p className="text-xs text-slate-500">
              Notes auto-save as you type in the editor.
            </p>
          </div>
        </div>

        {/* Status Message */}
        {!isFormValid && (title || content) && (
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {!title.trim() && !content.trim()
                ? "Add a title and content to create"
                : !title.trim()
                  ? "Add a title to continue"
                  : "Add content to continue"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreatePage;
