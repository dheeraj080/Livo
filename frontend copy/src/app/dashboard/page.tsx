'use client';

import { useEffect } from 'react';
import { useTaskStore, Task } from '@/store/useTaskStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/TaskForm';
import { TaskItem } from '@/components/TaskItem';
import { ProfileSection } from '@/components/ProfileSection';
import { Button } from '@/components/ui/Button';
import { LogOutIcon, UserIcon, CheckCircle2Icon, PlusIcon, LifeBuoyIcon, SettingsIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardPage() {
  const { tasks, fetchTasks, isLoading, error } = useTaskStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tasks' | 'profile'>('tasks');

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
    toast.success('Logged out');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <nav className="bg-card/50 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary/10">
            L
          </div>
          <h1 className="text-xl font-bold text-foreground hidden sm:block tracking-tighter">Livo</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
             <Button
                variant={activeTab === 'tasks' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-bold rounded-lg"
             >
                <CheckCircle2Icon size={14} className="mr-1.5" />
                Tasks
             </Button>
             <Button
                variant={activeTab === 'profile' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('profile')}
                className="text-xs font-bold rounded-lg"
             >
                <SettingsIcon size={14} className="mr-1.5" />
                Settings
             </Button>
          </div>

          <div className="h-8 w-[1px] bg-border hidden md:block mx-1" />

          <ThemeToggle />

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
            <UserIcon size={16} className="text-indigo-600" />
            <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">{user?.name}</span>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-200 text-slate-600 hover:text-red-600">
            <LogOutIcon size={18} />
          </Button>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
            {activeTab === 'tasks' ? (
                <div key="tasks-tab" className="animate-soft-fade">
                    <header className="mb-10 text-center">
                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Focus on what matters.
                        </h2>
                        <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                            Organize your tasks, prioritize your day, and achieve more with our premium productivity suite.
                        </p>
                    </header>

                    <TaskForm />

                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2Icon className="text-primary" size={24} />
                            Your Tasks
                            </h3>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-primary/20">
                            {tasks.length} entries
                            </span>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-48 gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                <p className="text-muted-foreground font-medium">Fetching your tasks...</p>
                            </div>
                            ) : error ? (
                            <div className="bg-destructive/5 text-destructive p-8 rounded-2xl border border-destructive/20 text-center shadow-lg animate-soft-fade">
                                <h4 className="font-bold text-lg mb-2">Sync Error</h4>
                                <p className="text-sm font-normal mb-6 opacity-75">{error}</p>
                                <Button variant="outline" size="sm" onClick={() => fetchTasks()} className="border-destructive/20 text-destructive hover:bg-destructive/10">
                                    Reconnect now
                                </Button>
                            </div>
                            ) : tasks.length === 0 ? (
                            <div className="bg-card border-2 border-dashed border-border rounded-3xl p-24 text-center shadow-inner">
                                <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 shadow-sm">
                                    <PlusIcon size={40} className="text-muted-foreground/30" />
                                </div>
                                <h4 className="text-2xl font-bold text-foreground mb-2 tracking-tight">The palace is empty</h4>
                                <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">Add a task above to begin your journey toward ultimate focus and clarity.</p>
                            </div>
                            ) : (
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {tasks.map((task: Task) => (
                                    <TaskItem key={task.id} task={task} />
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div key="profile-tab" className="animate-soft-fade max-w-xl mx-auto">
                    <header className="mb-10 text-center">
                        <h2 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                            Personal Preferences
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Manage your account details and security settings.
                        </p>
                    </header>
                    <ProfileSection />
                </div>
            )}
        </AnimatePresence>
      </main>

      <footer className="py-8 bg-card border-t border-border px-6 mt-12 transition-colors duration-300">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm font-medium">
             <div className="flex items-center gap-2">
                <LifeBuoyIcon size={16} className="text-primary/60" />
                <span>Need help? Contact support.</span>
             </div>
             <p>© 2026 Livo Monolith. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}
