export type TaskPriority = "low" | "medium" | "high" | "LOW" | "MEDIUM" | "HIGH";

export type TaskStatus = "pending" | "completed" | "PENDING" | "COMPLETED";

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: Date | null;
  completed: boolean;
  status: "PENDING" | "COMPLETED";
  createdAt: Date;
  updatedAt: Date;
  userId?: number | null;
}

export type TaskFilterType = "all" | "today" | "upcoming" | "overdue" | "completed";
