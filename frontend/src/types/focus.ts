export interface FocusSession {
  id: number;
  durationMin: number;
  completedAt: string;
  notes?: string | null;
  userId: number;
  taskId?: number | null;
  task?: {
    id: number;
    title: string;
  } | null;
}

export interface FocusSummary {
  todayMinutes: number;
  weekMinutes: number;
  totalSessions: number;
  recentSessions: FocusSession[];
}

export interface CreateFocusSessionInput {
  durationMin: number;
  taskId?: number | null;
  notes?: string;
}
