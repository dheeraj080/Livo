import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const { login } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-6xl md:text-8xl font-thin tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
          Mind Palace
        </h1>
        <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide leading-relaxed">
          Your digital sanctuary for thoughts, tasks, and everything in between.
          Secure. Private. Minimal.
        </p>

        <div className="pt-8">
          <button
            onClick={login}
            className="group relative px-8 py-3 bg-white text-black rounded-full font-bold transition-all hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 rounded-full bg-violet-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
            <span className="relative flex items-center gap-2">
              Connect with Google
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
