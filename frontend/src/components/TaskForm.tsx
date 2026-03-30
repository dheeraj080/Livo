'use client';

import { useTaskStore, TaskState, TaskPriority } from '@/store/useTaskStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.nativeEnum(TaskPriority),
});
type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskForm({ onSuccess }: { onSuccess?: (task: any) => void }) {
  const addTask = useTaskStore((state: TaskState) => state.addTask);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      dueDate: new Date().toISOString().split('T')[0],
      priority: TaskPriority.MEDIUM,
    },
  });

  const onSubmit = async (data: TaskFormValues) => {
    const newTask = await addTask(data);
    if (newTask && onSuccess) onSuccess(newTask);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full text-left">
      <div className="border-b border-border/80 pb-3 mb-3">
        <input
          className="w-full text-base font-semibold bg-transparent outline-none placeholder:text-muted-foreground/30 text-foreground"
          placeholder="New focus entry..."
          {...register('title')}
        />
        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <textarea
        className="w-full text-sm text-muted-foreground/70 bg-transparent outline-none resize-none h-16 placeholder:text-muted-foreground/20 mb-3"
        placeholder="Start architecting the details..."
        {...register('description')}
      />

      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="date"
          {...register('dueDate')}
          className={cn(
            'text-xs text-muted-foreground bg-muted border border-border rounded-lg px-3 py-1.5 outline-none',
            'focus:border-foreground/30 transition-colors cursor-pointer'
          )}
        />

        <select
          {...register('priority')}
          className="text-xs text-muted-foreground bg-muted border border-border rounded-lg px-3 py-1.5 outline-none cursor-pointer focus:border-foreground/30 transition-colors"
        >
          <option value={TaskPriority.LOW}>Low</option>
          <option value={TaskPriority.MEDIUM}>Medium</option>
          <option value={TaskPriority.HIGH}>High</option>
        </select>

        <Button type="submit" disabled={isSubmitting} size="sm" className="ml-auto gap-1.5">
          <PlusIcon size={13} />
          {isSubmitting ? 'Adding...' : 'Add task'}
        </Button>
      </div>
    </form>
  );
}
