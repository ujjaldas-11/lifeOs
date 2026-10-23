export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type FilterType = "all" | "today" | "upcoming" | "overdue" | "completed";
export type KanbanColumn = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: Priority;
  dueDate?: string | null;
  completed: boolean;
  status: "PENDING" | "COMPLETED";
  kanbanColumn?: KanbanColumn | string;
  projectId?: number | null;
  project?: {
    id: number;
    name: string;
  } | null;
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
  projectId?: number | null;
  kanbanColumn?: KanbanColumn | string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: Priority;
  dueDate?: string | null;
  completed?: boolean;
  projectId?: number | null;
  kanbanColumn?: KanbanColumn | string;
}
