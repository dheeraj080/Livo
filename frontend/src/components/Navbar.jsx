import React from "react";
import { Link } from "react-router";
import { PlusIcon, SparklesIcon, LogOutIcon } from "lucide-react"; // Added LogOutIcon
import { useAuth } from "../context/AuthContext"; // Import your context

const Navbar = () => {
  const { user, logout } = useAuth(); // Access user data and logout function

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-violet-500/10">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <Link
            to="/home"
            className="group flex items-center gap-3 transition-all"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full group-hover:bg-violet-500/30 transition-all" />
              <SparklesIcon className="size-6 text-violet-400 relative group-hover:text-violet-300 transition-colors" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent tracking-tight group-hover:from-violet-300 group-hover:to-blue-300 transition-all">
              Mind Palace
            </h1>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                {/* Create Note Button */}
                <Link
                  to="/create"
                  className="group relative px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                >
                  <div className="flex items-center gap-2">
                    <PlusIcon className="size-4 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="hidden sm:inline">New Note</span>
                  </div>
                </Link>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-white/10 mx-1" />

                {/* User Profile & Logout */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 px-2 py-1 rounded-full bg-white/5 border border-white/5">
                    <img
                      src={user?.avatar}
                      alt="profile"
                      referrerPolicy="no-referrer" // <--- Crucial for Google/Brave/Safari
                      className="size-8 rounded-full border border-violet-500/30 object-cover"
                    />
                    <span className="text-sm font-medium text-slate-200 hidden lg:block">
                      <span className="text-sm font-medium text-slate-200 hidden lg:block">
                        {user?.displayName?.split(" ")[0]}
                      </span>
                      {/* Show only first name */}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 transition-all"
                    title="Sign Out"
                  >
                    <LogOutIcon className="size-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
