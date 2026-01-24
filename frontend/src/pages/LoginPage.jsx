import { Github, Mail } from "lucide-react";

const SocialLogin = () => {
  const handleLogin = (provider) => {
    // Direct browser redirect to the backend
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  return (
    <div className="flex flex-col gap-4 w-full mt-8">
      <div className="relative flex items-center py-4">
        <div className="flex-grow border-t border-white/5"></div>
        <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest opacity-20">
          or enter via
        </span>
        <div className="flex-grow border-t border-white/5"></div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleLogin("google")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
        >
          <Mail className="size-4 text-emerald-400" />
          <span className="text-xs font-medium">Google</span>
        </button>

        <button
          onClick={() => handleLogin("github")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
        >
          <Github className="size-4 text-slate-400" />
          <span className="text-xs font-medium">GitHub</span>
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;
