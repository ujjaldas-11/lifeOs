export type TaskPriority = "low" | "medium" | "high" | "LOW" | "MEDIUM" | "HIGH";

export type TaskStatus = "pending" | "completed" | "PENDING" | "COMPLETED";

export type KanbanColumn = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: Date | null;
  completed: boolean;
  status: "PENDING" | "COMPLETED";
  kanbanColumn: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: number | null;
  projectId?: number | null;
  project?: {
    id: number;
    name: string;
  } | null;
}

export type TaskFilterType = "all" | "today" | "upcoming" | "overdue" | "completed";
