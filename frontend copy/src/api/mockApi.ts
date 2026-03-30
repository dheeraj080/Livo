import MockAdapter from 'axios-mock-adapter';
import { AxiosInstance } from 'axios';
import { TaskStatus, TaskPriority } from '@/store/useTaskStore';

export const setupMockApi = (axiosInstance: AxiosInstance) => {
  const mock = new MockAdapter(axiosInstance, { delayResponse: 500 });

  // Helper to get/set mock tasks in local storage
  const getMockTasks = () => {
    const saved = localStorage.getItem('mock_tasks');
    if (saved) return JSON.parse(saved);
    const initial = [
      { id: '1', task: 'Design Livo Brand Strategy', description: 'Create a timeless and elegant logo.', status: TaskStatus.OPEN, priority: TaskPriority.HIGH, dueDate: new Date().toISOString() },
      { id: '2', task: 'Implement OAuth2 Flow', description: 'Connect Google and GitHub providers.', status: TaskStatus.COMPLETE, priority: TaskPriority.MEDIUM, dueDate: new Date().toISOString() },
      { id: '3', task: 'Optimize Next.js 16 Performance', description: 'Monitor LCP and CLS on the dashboard.', status: TaskStatus.OPEN, priority: TaskPriority.LOW, dueDate: new Date().toISOString() },
    ];
    localStorage.setItem('mock_tasks', JSON.stringify(initial));
    return initial;
  };

  const saveMockTasks = (tasks: any[]) => {
    localStorage.setItem('mock_tasks', JSON.stringify(tasks));
  };

  // --- Auth ---
  mock.onPost('/auth/login').reply(200, {
    user: { id: 'user-1', name: 'Elite Explorer', email: 'test@livo.com' },
    accessToken: 'mock-jwt-token',
  });

  mock.onPost('/auth/register').reply(200, {
    id: 'user-1', name: 'Elite Explorer', email: 'test@livo.com'
  });

  mock.onGet('/users/me').reply(200, {
    id: 'user-1', name: 'Elite Explorer', email: 'test@livo.com'
  });

  mock.onPut(/\/users\/.+/).reply(200, {
    id: 'user-1', name: 'Elite Explorer', email: 'test@livo.com'
  });

  // --- Tasks ---
  mock.onGet('/tasks').reply(() => [200, getMockTasks()]);

  mock.onPost('/tasks').reply((config) => {
    const data = JSON.parse(config.data);
    const tasks = getMockTasks();
    const newTask = { 
        ...data, 
        id: Math.random().toString(36).substr(2, 9),
        status: TaskStatus.OPEN,
    };
    tasks.unshift(newTask);
    saveMockTasks(tasks);
    return [200, newTask];
  });

  mock.onPut(/\/tasks\/.+/).reply((config) => {
    const url = config.url || '';
    const id = url.split('/').pop();
    const data = JSON.parse(config.data);
    const tasks = getMockTasks();
    const index = tasks.findIndex((t: any) => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...data };
      saveMockTasks(tasks);
      return [200, tasks[index]];
    }
    return [404, { message: 'Task not found' }];
  });

  mock.onDelete(/\/tasks\/.+/).reply((config) => {
    const url = config.url || '';
    const id = url.split('/').pop();
    const tasks = getMockTasks();
    const filtered = tasks.filter((t: any) => t.id !== id);
    saveMockTasks(filtered);
    return [204];
  });

  console.log('🚀 Livo Mock Mode: System Activated');
};
