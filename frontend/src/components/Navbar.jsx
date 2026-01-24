import React from "react";
import { Link } from "react-router";
import { PlusIcon, SparklesIcon } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-violet-500/10">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/" className="group flex items-center gap-3 transition-all">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full group-hover:bg-violet-500/30 transition-all" />
              <SparklesIcon className="size-6 text-violet-400 relative group-hover:text-violet-300 transition-colors" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent tracking-tight group-hover:from-violet-300 group-hover:to-blue-300 transition-all">
              Mind Palace
            </h1>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/create"
              className="group relative px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              <div className="flex items-center gap-2">
                <PlusIcon className="size-4 group-hover:rotate-90 transition-transform duration-300" />
                <span>New Note</span>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
