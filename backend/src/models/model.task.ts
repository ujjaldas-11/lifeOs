export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus = "pending" | "completed";

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

