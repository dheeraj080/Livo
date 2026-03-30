'use client';

import { useEffect, useState } from 'react';
import { useTaskStore, Task, TaskStatus, TaskPriority } from '@/store/useTaskStore';
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
  CheckCircle,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { ProfileSection } from '@/components/ProfileSection';
import { Button } from '@/components/ui/Button';
import { CalendarWidget } from '@/components/CalendarWidget';

export default function DashboardPage() {
  const { tasks, fetchTasks, deleteTask, updateTask } = useTaskStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [localTask, setLocalTask] = useState<string>('');
  const [localDescription, setLocalDescription] = useState<string>('');
  const [localDueDate, setLocalDueDate] = useState<string>('');
  const [localPriority, setLocalPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Get all task dates for highlighting
  const taskDates = tasks.map(t => new Date(t.dueDate).toISOString().split('T')[0]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  useEffect(() => {
    if (selectedTask) {
      setLocalTask(selectedTask.task);
      setLocalDescription(selectedTask.description || '');
      setLocalDueDate(new Date(selectedTask.dueDate).toISOString().split('T')[0]);
      setLocalPriority(selectedTask.priority);
    } else {
      setLocalTask('');
      setLocalDescription('');
      setLocalDueDate('');
      setLocalPriority(TaskPriority.MEDIUM);
    }
  }, [selectedTaskId, selectedTask?.id]);

  // Debounced update for text fields
  useEffect(() => {
    if (!selectedTaskId || !selectedTask) return;

    const timeout = setTimeout(() => {
      if (localTask !== selectedTask.task || localDescription !== selectedTask.description) {
        updateTask(selectedTaskId, { task: localTask, description: localDescription });
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [localTask, localDescription, selectedTaskId, updateTask]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
    toast.success('Logged out');
  };

  const handleDelete = async () => {
    if (!selectedTaskId) return;
    if (confirm('Are you sure you want to delete this entry?')) {
      await deleteTask(selectedTaskId);
      setSelectedTaskId(null);
    }
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as TaskPriority;
    setLocalPriority(val);
    if (selectedTaskId) {
      updateTask(selectedTaskId, { priority: val });
    }
  };

  const handleDueDateChange = (date: string) => {
    setLocalDueDate(date);
    if (selectedTaskId) {
      updateTask(selectedTaskId, { dueDate: date });
    }
  };

  const filteredTasks = tasks.filter(t =>
    t.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background text-foreground antialiased font-sans transition-colors duration-300">

      {/* COLUMN 1: Sidebar (Folders) */}
      <aside className="w-64 bg-muted/30 border-r border-border/40 flex flex-col pt-12 pb-6 px-4 gap-8">
        <div className="flex items-center gap-3 px-2 mb-2 group cursor-pointer" onClick={() => setIsProfileOpen(true)}>
          <div className="w-9 h-9 rounded-squircle-sm bg-foreground flex items-center justify-center text-background shadow-sm">
            <User size={18} />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-semibold truncate leading-tight">{user.name}</h4>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Member</p>
          </div>
        </div>

        <nav className="flex flex-col gap-6">
          <section>
            <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-3">Folders</h5>
            <div className="space-y-0.5">
              {[
                { id: 'all', label: 'All Entries', icon: LayoutGrid, active: !isProfileOpen },
                { id: 'favorites', label: 'Favorites', icon: Star },
                { id: 'history', label: 'Recently Deleted', icon: History },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setIsProfileOpen(false)}
                  className={cn(
                    "flex items-center justify-between w-full p-2.5 text-sm rounded-squircle-sm transition-all group",
                    item.active && item.id === 'all' ? "bg-foreground/5 text-foreground font-medium" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={15} className={cn("transition-transform group-hover:scale-105", item.active && item.id === 'all' ? "text-foreground" : "opacity-60")} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'all' && <span className="text-[10px] font-bold text-muted-foreground/40 bg-foreground/5 px-1.5 py-0.5 rounded">{tasks.length}</span>}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-3">Settings</h5>
            <button
              onClick={() => setIsProfileOpen(true)}
              className={cn(
                "flex items-center gap-3 w-full p-2.5 text-sm rounded-lg transition-all group",
                isProfileOpen ? "bg-foreground/10 text-foreground font-medium" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <Settings size={15} className={cn("group-hover:rotate-45 transition-transform", isProfileOpen ? "text-foreground" : "opacity-60")} />
              <span>Security & Profile</span>
            </button>
          </section>
        </nav>

        {/* Calendar Widget Integration */}
        <div className="px-1 mt-2">
          <CalendarWidget
            selectedDate={localDueDate || undefined}
            onChange={handleDueDateChange}
            highlightDates={taskDates}
            isNoteActive={!!selectedTaskId && !isProfileOpen}
            className="bg-transparent border-none p-0"
          />
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
          <ThemeToggle />
          <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* COLUMN 2: Note List (Tasks) */}
      <section className="w-80 border-r border-border/40 flex flex-col bg-card/40 backdrop-blur-sm animate-fade-in">
        <header className="p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Focus</h2>
            <button
              className="p-1.5 text-foreground hover:bg-muted rounded-lg transition-all"
              onClick={() => {
                setSelectedTaskId(null);
                setIsProfileOpen(false);
              }}
              title="New Focus"
            >
              <SquarePen size={18} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <input
              className="w-full bg-muted/30 border border-border/40 rounded-squircle-sm py-2 pl-9 pr-4 text-xs focus:bg-muted/50 focus:outline-none transition-all"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] leading-loose">The space is empty</p>
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
                  "p-4 rounded-squircle cursor-pointer transition-all relative group",
                  selectedTaskId === task.id && !isProfileOpen
                    ? "bg-muted shadow-sm ring-1 ring-border"
                    : "hover:bg-muted/40"
                )}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className={cn(
                      "text-sm font-semibold truncate",
                      task.status === 'COMPLETE' ? "text-muted-foreground/40 line-through font-normal" : "text-foreground"
                    )}>
                      {task.task}
                    </h5>
                    {task.status === 'COMPLETE' && <CheckCircle size={12} className="text-muted-foreground/30" />}
                  </div>
                  <p className={cn(
                    "text-[11px] truncate leading-relaxed",
                    task.status === 'COMPLETE' ? "text-muted-foreground/20" : "text-muted-foreground"
                  )}>
                    {task.description || "No context added..."}
                  </p>
                  <div className="mt-1 flex items-center gap-2.5 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-wider">
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/10" />
                    <span className={cn(
                      task.priority === 'HIGH' ? "text-destructive/50" : task.priority === 'LOW' ? "text-muted-foreground/20" : ""
                    )}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                {selectedTaskId === task.id && !isProfileOpen && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/20">
                    <ChevronRight size={14} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* COLUMN 3: Task Preview / Editor */}
      <main className="flex-1 bg-background relative overflow-y-auto">
        <AnimatePresence mode="wait">
          {isProfileOpen ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="max-w-xl mx-auto py-20 px-8"
            >
              <ProfileSection />
            </motion.div>
          ) : selectedTask ? (
            <motion.div
              key={selectedTask.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto py-16 px-8 h-full flex flex-col"
            >
              {/* Editor Header */}
              <header className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => useTaskStore.getState().toggleTaskStatus(selectedTask)}>
                    <button className={cn(
                      "w-5 h-5 rounded-squircle-sm border flex items-center justify-center transition-all",
                      selectedTask.status === 'COMPLETE' ? "bg-foreground border-foreground text-background" : "border-border hover:border-foreground"
                    )}>
                      {selectedTask.status === 'COMPLETE' && <CheckCircle size={12} />}
                    </button>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.1em] transition-colors",
                      selectedTask.status === 'COMPLETE' ? "text-foreground" : "text-muted-foreground/40 group-hover:text-muted-foreground"
                    )}>
                      {selectedTask.status === 'COMPLETE' ? 'Completed' : 'Mark Complete'}
                    </span>
                  </div>

                  <div className="h-4 w-px bg-border" />

                  <div className="flex items-center gap-4">
                    {/* Priority Select */}
                    <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="text-muted-foreground/30" />
                      <select
                        value={localPriority}
                        onChange={handlePriorityChange}
                        className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 border-none outline-none hover:text-foreground cursor-pointer appearance-none"
                      >
                        <option value={TaskPriority.LOW}>Low </option>
                        <option value={TaskPriority.MEDIUM}>Medium </option>
                        <option value={TaskPriority.HIGH}>High </option>
                      </select>
                    </div>

                    {/* Date Input */}
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-muted-foreground/30" />
                      <input
                        type="date"
                        value={localDueDate}
                        onChange={(e) => handleDueDateChange(e.target.value)}
                        className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 border-none outline-none hover:text-foreground cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDelete}
                  className="p-2 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
                  title="Delete Entry"
                >
                  <Trash2 size={16} />
                </button>
              </header>

              {/* Editor Content */}
              <div className="flex-1 space-y-8">
                <input
                  className="w-full text-[2.5rem] font-medium tracking-tight bg-transparent border-none p-0 focus:ring-0 text-foreground placeholder:text-muted-foreground/10 outline-none leading-none"
                  style={{ fontFamily: 'var(--font-display)' }}
                  value={localTask}
                  onChange={(e) => setLocalTask(e.target.value)}
                  placeholder="Focus Title"
                />
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <textarea
                    className="w-full text-base text-muted-foreground leading-relaxed bg-transparent border-none p-0 focus:ring-0 placeholder:text-muted-foreground/10 resize-none h-[calc(100vh-400px)] outline-none"
                    value={localDescription}
                    onChange={(e) => setLocalDescription(e.target.value)}
                    placeholder="Start articulating..."
                  />
                </div>
              </div>

              <footer className="mt-auto py-8 text-[9px] text-muted-foreground/20 font-bold uppercase tracking-[0.2em] text-center">
                Permanent Revision • Editorial Suite
              </footer>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center p-12 text-center"
            >
              <div className="max-w-sm space-y-8 w-full">
                <div className="w-16 h-16 bg-muted/40 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <Plus size={24} className="text-muted-foreground/20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium tracking-tight" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>New Clarity</h3>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-[28ch] mx-auto">Select a previous thought or begin architecting a new focus below.</p>
                </div>
                <div className="bg-card/40 border border-border/40 p-6 rounded-2xl">
                  <TaskForm onSuccess={(task) => setSelectedTaskId(task.id)} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}
