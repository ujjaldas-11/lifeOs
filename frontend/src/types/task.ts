export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type FilterType = "all" | "today" | "upcoming" | "overdue" | "completed";

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: Priority;
  dueDate?: string | null;
  completed: boolean;
  status: "PENDING" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  userId?: number | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string | null;
  completed?: boolean;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: Priority;
  dueDate?: string | null;
  completed?: boolean;
}
