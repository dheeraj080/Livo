'use client';

import { useTaskStore, TaskState, TaskPriority } from '@/store/useTaskStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.nativeEnum(TaskPriority),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskForm() {
  const addTask = useTaskStore((state: TaskState) => state.addTask);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      dueDate: new Date().toISOString().split('T')[0],
      priority: TaskPriority.MEDIUM,
    }
  });

  const onSubmit = async (data: TaskFormValues) => {
    await addTask(data.title, data.description || '', data.dueDate, data.priority);
    reset();
  };

  return (
    <Card className="mb-8 border-indigo-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-indigo-900">Add New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Input
                placeholder="What needs to be done?"
                {...register('title')}
                error={!!errors.title}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <Input
                placeholder="Description (optional)"
                {...register('description')}
              />
            </div>
            <div className="space-y-1">
              <Input
                type="date"
                {...register('dueDate')}
                error={!!errors.dueDate}
              />
              {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate.message}</p>}
            </div>
            <div className="space-y-1">
              <select
                {...register('priority')}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting} className="md:self-end">
            <PlusIcon size={20} className="mr-2" />
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
