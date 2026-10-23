export interface Habit {
  id: number;
  name: string;
  frequency: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  logs?: HabitLog[];
  completedToday?: boolean;
}

export interface HabitLog {
  id: number;
  habitId: number;
  date: string;
  completedAt: Date;
}

export interface CreateHabitInput {
  name: string;
  frequency?: string | undefined;
}

export interface UpdateHabitInput {
  name?: string | undefined;
  frequency?: string | undefined;
}
