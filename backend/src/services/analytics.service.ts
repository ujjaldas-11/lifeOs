import { prisma } from "../lib/prisma.js";
import { getLocalDateString } from "./habit.service.js";

export const getActivityHeatmap = async (userId: number, days = 90) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Fetch all completed activities across modules
  const [completedTasks, habitLogs, createdNotes, focusSessions] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        completed: true,
        updatedAt: { gte: startDate },
      },
      select: { updatedAt: true },
    }),
    prisma.habitLog.findMany({
      where: {
        habit: { userId },
        completedAt: { gte: startDate },
      },
      select: { date: true, completedAt: true },
    }),
    prisma.note.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      select: { createdAt: true },
    }),
    prisma.focusSession.findMany({
      where: {
        userId,
        completedAt: { gte: startDate },
      },
      select: { completedAt: true, durationMin: true },
    }),
  ]);

  // Aggregate daily counts in a map
  const dailyMap: Record<
    string,
    {
      date: string;
      count: number;
      tasks: number;
      habits: number;
      notes: number;
      focusMinutes: number;
    }
  > = {};

  // Initialize all days in the range
  const cursor = new Date(startDate);
  const today = new Date();
  while (cursor <= today) {
    const dStr = getLocalDateString(cursor);
    dailyMap[dStr] = {
      date: dStr,
      count: 0,
      tasks: 0,
      habits: 0,
      notes: 0,
      focusMinutes: 0,
    };
    cursor.setDate(cursor.getDate() + 1);
  }

  // Populate Tasks
  for (const t of completedTasks) {
    const dStr = getLocalDateString(t.updatedAt);
    if (dailyMap[dStr]) {
      dailyMap[dStr].tasks++;
      dailyMap[dStr].count++;
    }
  }

  // Populate Habits
  for (const h of habitLogs) {
    const dStr = h.date;
    if (dailyMap[dStr]) {
      dailyMap[dStr].habits++;
      dailyMap[dStr].count++;
    }
  }

  // Populate Notes
  for (const n of createdNotes) {
    const dStr = getLocalDateString(n.createdAt);
    if (dailyMap[dStr]) {
      dailyMap[dStr].notes++;
      dailyMap[dStr].count++;
    }
  }

  // Populate Focus Sessions
  for (const f of focusSessions) {
    const dStr = getLocalDateString(f.completedAt);
    if (dailyMap[dStr]) {
      dailyMap[dStr].focusMinutes += f.durationMin;
      dailyMap[dStr].count += Math.round(f.durationMin / 25);
    }
  }

  return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
};

export const getWeeklyRetrospective = async (userId: number) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [finishedTasks, activeHabits, recentLogs, createdNotes, focusSessions] =
    await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          completed: true,
          updatedAt: { gte: sevenDaysAgo },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.habit.findMany({
        where: { userId },
        select: { id: true, name: true, currentStreak: true },
      }),
      prisma.habitLog.findMany({
        where: {
          habit: { userId },
          completedAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.note.findMany({
        where: {
          userId,
          createdAt: { gte: sevenDaysAgo },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.focusSession.findMany({
        where: {
          userId,
          completedAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMin, 0);
  const possibleHabitCheckins = activeHabits.length * 7;
  const consistencyRate =
    possibleHabitCheckins > 0
      ? Math.round((recentLogs.length / possibleHabitCheckins) * 100)
      : 0;

  return {
    period: "Past 7 Days",
    tasksCompletedCount: finishedTasks.length,
    finishedTasks: finishedTasks.slice(0, 5),
    habitsCheckinsCount: recentLogs.length,
    consistencyRate,
    totalFocusMinutes,
    totalFocusHours: (totalFocusMinutes / 60).toFixed(1),
    focusSessionsCount: focusSessions.length,
    notesCreatedCount: createdNotes.length,
    recentNotes: createdNotes.slice(0, 3),
  };
};
