'use client';

import { Task, useTaskStore, TaskStatus, TaskPriority } from '@/store/useTaskStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Trash2Icon, CheckCircle2Icon, CalendarIcon, AlertCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { deleteTask, toggleTaskStatus } = useTaskStore();
  const formattedDate = new Date(task.dueDate).toLocaleDateString();
  const isCompleted = task.status === TaskStatus.COMPLETE;

  const priorityColors = {
    [TaskPriority.LOW]: 'bg-slate-400',
    [TaskPriority.MEDIUM]: 'bg-indigo-500',
    [TaskPriority.HIGH]: 'bg-red-500',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn('relative overflow-hidden group', isCompleted && 'bg-slate-50')}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={cn(
              "w-2 h-12 rounded-full shrink-0",
              isCompleted ? "bg-green-500" : priorityColors[task.priority]
            )} />
            <div className="flex-1">
              <h4 className={cn('text-lg font-semibold', isCompleted && 'line-through text-slate-400')}>
                {task.task}
              </h4>
              {task.description && (
                <p className={cn('text-sm text-slate-500', isCompleted && 'text-slate-300')}>
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                    <CalendarIcon size={12} />
                    <span>Due: {formattedDate}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <AlertCircleIcon size={12} />
                    <span>{task.priority}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleTaskStatus(task)}
                className={cn(isCompleted ? "text-green-500 hover:text-green-600 hover:bg-green-50" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50")}
            >
              <CheckCircle2Icon size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2Icon size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
