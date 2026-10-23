export interface HabitLog {
  id: number;
  habitId: number;
  date: string;
  completedAt: string;
}

export interface Habit {
  id: number;
  name: string;
  frequency: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
  logs?: HabitLog[];
  completedToday?: boolean;
}

export interface CreateHabitInput {
  name: string;
  frequency?: string;
}

export interface UpdateHabitInput {
  name?: string;
  frequency?: string;
}
