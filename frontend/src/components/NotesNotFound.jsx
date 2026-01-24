import { SparklesIcon, PlusIcon } from "lucide-react";
import { Link } from "react-router";

const NotesNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 space-y-8 max-w-md mx-auto text-center">
      {/* Icon with glow effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative bg-gradient-to-br from-violet-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-8 border border-violet-500/20">
          <SparklesIcon className="size-12 text-violet-400" />
        </div>
      </div>

      {/* Text content */}
      <div className="space-y-3">
        <h3 className="text-3xl font-bold text-slate-100">
          Your canvas awaits
        </h3>
        <p className="text-slate-400 leading-relaxed">
          Start capturing your ideas, thoughts, and inspirations. Your first
          note is just a click away.
        </p>
      </div>

      {/* CTA Button */}
      <Link
        to="/create"
        className="group relative px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
      >
        <div className="flex items-center gap-2">
          <PlusIcon className="size-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Create First Note</span>
        </div>
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </Link>
    </div>
  );
};

export default NotesNotFound;
