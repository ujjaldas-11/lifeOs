export interface FocusSession {
  id: number;
  durationMin: number;
  taskTitle?: string | null;
  taskId?: number | null;
  completedAt: Date;
  userId: number;
}

export interface LogFocusSessionInput {
  durationMin: number;
  taskTitle?: string | null | undefined;
  taskId?: number | null | undefined;
}
