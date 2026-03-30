'use client';

import { useEffect, useState } from 'react';
import { useTaskStore, Task } from '@/store/useTaskStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/TaskForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
    LayoutGrid, 
    Star, 
    ChevronRight, 
    Settings, 
    LogOut,
    Plus,
    Search,
    SquarePen,
    History,
    User,
    CheckCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { ProfileSection } from '@/components/ProfileSection';

export default function DashboardPage() {
  const { tasks, fetchTasks } = useTaskStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [localTask, setLocalTask] = useState<string>('');
  const [localDescription, setLocalDescription] = useState<string>('');
  const updateTask = useTaskStore(state => state.updateTask);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  // Default selection (only once on load or if task list changes and we had nothing)
  useEffect(() => {
    if (tasks.length > 0 && selectedTaskId === null && !isProfileOpen && searchQuery === '') {
        // Only auto-select if we haven't explicitly cleared it
        // Or actually, just do it on first load
    }
  }, [tasks]);

  // Sync local state with selected task
  useEffect(() => {
    if (selectedTask) {
        setLocalTask(selectedTask.task);
        setLocalDescription(selectedTask.description || '');
    } else {
        setLocalTask('');
        setLocalDescription('');
    }
  }, [selectedTaskId, selectedTask?.id]);

  // Debounced update
  useEffect(() => {
    if (!selectedTaskId || !selectedTask) return;
    
    const timeout = setTimeout(() => {
        if (localTask !== selectedTask.task || localDescription !== selectedTask.description) {
            updateTask(selectedTaskId, { task: localTask, description: localDescription });
        }
    }, 800); // 800ms debounce for smoothness
    
    return () => clearTimeout(timeout);
  }, [localTask, localDescription, selectedTaskId, updateTask]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
    toast.success('Logged out');
  };

  const filteredTasks = tasks.filter(t => 
    t.task.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background text-foreground antialiased font-sans transition-colors duration-300">
      
      {/* COLUMN 1: Sidebar (Folders) */}
      <aside className="w-64 bg-background dark:bg-[#1d1d1f] border-r border-border/40 flex flex-col pt-12 pb-6 px-4">
        <div className="flex items-center gap-3 px-2 mb-8 group cursor-pointer" onClick={() => setIsProfileOpen(true)}>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
             <User size={20} />
          </div>
          <div className="flex-1 overflow-hidden">
             <h4 className="text-sm font-bold truncate">{user.name}</h4>
             <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Livo Member</p>
          </div>
        </div>

        <nav className="flex-1 space-y-6">
          <section>
            <h5 className="text-[11px] font-bold text-muted-foreground/60 px-2 uppercase tracking-widest mb-3">Folders</h5>
            <div className="space-y-0.5">
              {[
                { id: 'all', label: 'All Tasks', icon: LayoutGrid, active: !isProfileOpen },
                { id: 'history', label: 'Recently Deleted', icon: History },
                { id: 'favorites', label: 'Favorites', icon: Star },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setIsProfileOpen(false)}
                  className={cn(
                    "flex items-center justify-between w-full p-2 text-sm rounded-lg transition-colors group",
                    item.active ? "bg-primary/10 text-primary" : "hover:bg-black/5 dark:hover:bg-white/5 text-foreground/80 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon size={16} className={cn("transition-transform group-hover:scale-110", item.active && "text-primary")} />
                    <span>{item.label}</span>
                  </div>
                  {item.label === 'All Tasks' && <span className="text-xs font-bold bg-black/5 text-muted-foreground px-1.5 rounded">{tasks.length}</span>}
                </button>
              ))}
            </div>
          </section>

          <section>
             <h5 className="text-[11px] font-bold text-muted-foreground/60 px-2 uppercase tracking-widest mb-3">Settings</h5>
             <button
               onClick={() => setIsProfileOpen(true)}
               className={cn(
                  "flex items-center gap-2.5 w-full p-2 text-sm rounded-lg transition-all group",
                  isProfileOpen ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5"
               )}
             >
                <Settings size={16} className="group-hover:rotate-45 transition-transform" />
                <span>Security & Profile</span>
             </button>
          </section>
        </nav>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
           <ThemeToggle />
           <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
              <LogOut size={18} />
           </button>
        </div>
      </aside>

      {/* COLUMN 2: Note List (Tasks) */}
      <section className="w-80 border-r border-border/40 flex flex-col bg-card animate-soft-fade">
         <header className="p-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-extrabold tracking-tight">Tasks</h2>
               <button 
                 className="p-1.5 text-primary hover:bg-primary/5 rounded-lg transition-all" 
                 onClick={() => {
                   setSelectedTaskId(null);
                   setIsProfileOpen(false);
                 }}
               >
                  <SquarePen size={20} />
               </button>
            </div>
            <div className="relative">
               <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground/40" />
               <input 
                 className="w-full bg-muted/20 border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/60 transition-all shadow-inner"
                 placeholder="Search entries..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
         </header>

         <div className="flex-1 overflow-y-auto space-y-px p-2">
            {filteredTasks.length === 0 ? (
               <div className="p-12 text-center">
                  <p className="text-xs font-bold text-muted-foreground/30 uppercase tracking-widest leading-loose">The palace is quiet</p>
               </div>
            ) : (
                filteredTasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsProfileOpen(false);
                      }}
                      className={cn(
                        "p-4 rounded-2xl cursor-pointer transition-all duration-300 relative group",
                        selectedTaskId === task.id && !isProfileOpen ? "bg-accent shadow-sm" : "hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                         <div className={cn(
                            "w-1 h-8 rounded-full shrink-0 mt-1",
                            task.status === 'COMPLETE' ? "bg-green-500/30" : "bg-primary"
                         )} />
                         <div className="flex-1 overflow-hidden">
                           <h5 className={cn(
                               "text-sm font-bold truncate",
                               task.status === 'COMPLETE' ? "text-muted-foreground decoration-primary line-through opacity-60" : "text-card-foreground"
                           )}>
                              {task.task}
                           </h5>
                           <p className="text-[11px] text-muted-foreground/80 truncate mt-1 leading-relaxed">
                              {task.description || "No additional notes..."}
                           </p>
                           <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                              <span>{task.priority || 'NORMAL'}</span>
                           </div>
                         </div>
                      </div>
                      {selectedTaskId === task.id && !isProfileOpen && (
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary opacity-50 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={16} />
                         </div>
                      )}
                    </div>
                ))
            )}
         </div>
      </section>

      {/* COLUMN 3: Task Preview / Editor */}
      <main className="flex-1 bg-card relative overflow-y-auto custom-scrollbar">
         <AnimatePresence mode="wait">
            {isProfileOpen ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-2xl mx-auto py-20 px-8"
                >
                  <ProfileSection />
              </motion.div>
            ) : selectedTask ? (
              <motion.div
                key={selectedTask.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto py-16 px-12 h-screen flex flex-col"
              >
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                       {selectedTask.status}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                       Due: {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                     <CheckCircle 
                        size={22} 
                        className={cn(
                            "cursor-pointer transition-all hover:scale-110",
                            selectedTask.status === 'COMPLETE' ? "text-green-500" : "text-muted-foreground/20 hover:text-green-400"
                        )}
                        onClick={() => useTaskStore.getState().toggleTaskStatus(selectedTask)}
                     />
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                   <input
                     className="w-full text-5xl font-black tracking-tight bg-transparent border-none p-0 focus:ring-0 text-foreground/90 placeholder:text-foreground/20 outline-none"
                     value={localTask}
                     onChange={(e) => setLocalTask(e.target.value)}
                     placeholder="Concept Title"
                   />
                   <div className="prose dark:prose-invert max-w-none">
                      <textarea
                        className="w-full text-xl text-muted-foreground leading-relaxed font-medium bg-transparent border-none p-0 focus:ring-0 placeholder:text-muted-foreground/20 resize-none h-auto min-h-[50vh] custom-scrollbar"
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        placeholder="Start architecting your vision..."
                      />
                   </div>
                </div>
                
                <footer className="mt-auto py-8 text-[11px] text-muted-foreground/20 font-bold uppercase tracking-widest text-center border-t border-border/40">
                   Monolith Edition • Last modified mapping active
                </footer>
              </motion.div>
            ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center p-12 text-center"
                >
                <div className="max-w-sm space-y-6 w-full">
                    <div className="w-16 h-16 bg-muted/60 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-pulse">
                        <Plus size={32} className="text-muted-foreground/20" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold tracking-tight text-foreground/80">Focused Creation</h3>
                        <p className="text-xs text-muted-foreground/60 leading-relaxed">Select an entry or architect a new focus to begin.</p>
                    </div>
                    <TaskForm onSuccess={(task) => setSelectedTaskId(task.id)} />
                </div>
              </motion.div>
            )}
         </AnimatePresence>
      </main>

    </div>
  );
}
