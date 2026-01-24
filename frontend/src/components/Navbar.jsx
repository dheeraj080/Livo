import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ChevronLeftIcon,
  SidebarIcon,
  SquarePenIcon,
  LogOutIcon,
  ShareIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // Import your theme hook

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Access theme state
  const location = useLocation();
  const navigate = useNavigate();

  const isDetailView = location.pathname.includes("/note/");

  if (location.pathname === "/") return null;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 dark:bg-[#1c1c1e]/75 border-b border-zinc-200 dark:border-white/[0.05] transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4 h-12 flex items-center justify-between">
        {/* LEFT: Navigation Context */}
        <div className="flex items-center gap-2">
          {isDetailView ? (
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-1 text-[#d4a017] hover:opacity-70 transition-all"
            >
              <ChevronLeftIcon className="size-6 stroke-[2.5]" />
              <span className="text-base font-medium">Notes</span>
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-lg text-[#d4a017] transition-colors">
                <SidebarIcon className="size-5" />
              </button>
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white/90 select-none">
                Notes
              </h1>
            </div>
          )}
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-1">
          {/* THE THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="p-2 text-[#d4a017] hover:bg-zinc-200 dark:hover:bg-white/10 rounded-lg transition-all mr-1"
            title={
              theme === "black" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {theme === "black" ? (
              <SunIcon className="size-5 stroke-[2.5]" />
            ) : (
              <MoonIcon className="size-5 stroke-[2.5]" />
            )}
          </button>

          {user && (
            <>
              {isDetailView && (
                <button className="p-2 text-[#d4a017] hover:bg-zinc-200 dark:hover:bg-white/10 rounded-lg transition-all">
                  <ShareIcon className="size-5" />
                </button>
              )}

              <Link
                to="/create"
                className="p-2 text-[#d4a017] hover:bg-zinc-200 dark:hover:bg-white/10 rounded-lg transition-all"
                title="New Note"
              >
                <SquarePenIcon className="size-5" />
              </Link>

              <div className="h-4 w-px bg-zinc-200 dark:bg-white/10 mx-2" />

              {/* User Profile */}
              <div className="flex items-center gap-3 ml-1">
                <div className="flex items-center gap-2">
                  <img
                    src={user?.avatar}
                    alt="profile"
                    referrerPolicy="no-referrer"
                    className="size-7 rounded-full border border-zinc-200 dark:border-white/10 object-cover"
                  />
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight hidden lg:block">
                    {user?.displayName?.split(" ")[0]}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOutIcon className="size-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
