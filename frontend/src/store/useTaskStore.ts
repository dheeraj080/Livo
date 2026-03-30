import { create } from 'zustand';
import api from '@/api/axios';
import { toast } from 'react-hot-toast';
import { Task, TaskStatus, TaskPriority } from '@/types/tasks';

export { TaskStatus, TaskPriority };
export type { Task };

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (data: { title: string; description?: string; dueDate: string; priority: TaskPriority }) => Promise<Task | void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (task: Task) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/tasks');
      set({ tasks: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch tasks';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },
  addTask: async (data: { title: string; description?: string; dueDate: string; priority: TaskPriority }) => {
    const loadingToast = toast.loading('Adding focus entry...');
    try {
      const payload = {
          task: data.title,
          description: data.description,
          dueDate: data.dueDate,
          priority: data.priority
      };
      const response = await api.post('/tasks', payload);
      set({ tasks: [response.data, ...get().tasks] }); // Unshift to top
      toast.success('Entry architected', { id: loadingToast });
      return response.data; // Return to allow selection
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add entry';
      toast.error(message, { id: loadingToast });
    }
  },
  updateTask: async (id, updates) => {
    try {
      const payload = {
          ...updates,
          title: (updates as any).task || undefined // Map to title for backend legacy support
      };
      const response = await api.put(`/tasks/${id}`, payload);
      set({
        tasks: get().tasks.map((t) => (t.id === id ? response.data : t)),
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  },
  toggleTaskStatus: async (task) => {
    const newStatus = task.status === TaskStatus.OPEN ? TaskStatus.COMPLETE : TaskStatus.OPEN;
    try {
      const response = await api.put(`/tasks/${task.id}`, {
        ...task,
        title: task.task, // backend expects title in update request
        status: newStatus,
      });
      set({
        tasks: get().tasks.map((t) => (t.id === task.id ? response.data : t)),
      });
      toast.success(newStatus === TaskStatus.COMPLETE ? 'Task completed!' : 'Task reopened');
    } catch (error: any) {
      toast.error('Failed to toggle task status');
    }
  },
  deleteTask: async (id) => {
    const loadingToast = toast.loading('Deleting task...');
    try {
      await api.delete(`/tasks/${id}`);
      set({ tasks: get().tasks.filter((task) => task.id !== id) });
      toast.success('Task deleted', { id: loadingToast });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete task';
      toast.error(message, { id: loadingToast });
    }
  },
}));
