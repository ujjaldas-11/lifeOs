export interface HeatmapDay {
  date: string;
  count: number;
  tasks: number;
  habits: number;
  notes: number;
  focusMinutes: number;
}

export interface WeeklyRetrospective {
  period: string;
  tasksCompletedCount: number;
  finishedTasks: Array<{
    id: number;
    title: string;
    completed: boolean;
    updatedAt: string;
  }>;
  habitsCheckinsCount: number;
  consistencyRate: number;
  totalFocusMinutes: number;
  totalFocusHours: string;
  focusSessionsCount: number;
  notesCreatedCount: number;
  recentNotes: Array<{
    id: number;
    title: string;
    createdAt: string;
  }>;
}
