'use client';

import { useTaskStore, TaskState, TaskPriority } from '@/store/useTaskStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
    }
  });

  const onSubmit = async (data: TaskFormValues) => {
    const newTask = await addTask(data);
    if (newTask && onSuccess) {
        onSuccess(newTask);
    }
    reset();
  };

  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur-md shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <Input
              placeholder="What's the main focus?"
              {...register('title')}
              error={!!errors.title}
              className="text-lg font-bold bg-transparent border-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/30"
            />
            {errors.title && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <textarea
              placeholder="Architect the details..."
              {...register('description')}
              className={cn(
                "w-full bg-transparent border-none p-0 text-sm focus:ring-0 placeholder:text-muted-foreground/30 resize-none h-24 custom-scrollbar",
                errors.description && "text-red-500"
              )}
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-border/40">
            <div className="flex-1">
                <Input
                    type="date"
                    {...register('dueDate')}
                    error={!!errors.dueDate}
                    className="bg-muted/40 border-none text-[10px] font-bold uppercase tracking-widest h-8"
                />
            </div>
            
            <select
                {...register('priority')}
                className="bg-muted/40 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer hover:bg-muted/60 transition-colors"
            >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
            </select>

            <Button type="submit" disabled={isSubmitting} size="sm" className="rounded-full px-6 bg-amber-500 text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all">
                {isSubmitting ? 'Architecting...' : 'Create Note'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
