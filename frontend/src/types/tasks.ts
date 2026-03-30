export enum TaskStatus {
  OPEN = 'OPEN',
  COMPLETE = 'COMPLETE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Task {
  id: string;
  task: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}
