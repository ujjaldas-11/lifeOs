import { prisma } from "../lib/prisma.js";
import type { CreateHabitInput, UpdateHabitInput } from "../models/model.habit.js";

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const calculateStreaks = (
  dateStrings: string[]
): { currentStreak: number; longestStreak: number } => {
  if (dateStrings.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dateSet = new Set(dateStrings);
  const today = getLocalDateString(new Date());

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getLocalDateString(yesterdayDate);

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let checkDate = new Date();

  // If checked in today, count backwards from today
  if (dateSet.has(today)) {
    while (dateSet.has(getLocalDateString(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else if (dateSet.has(yesterday)) {
    // If not checked in today yet, check backwards from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    while (dateSet.has(getLocalDateString(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // 2. Calculate Longest Streak
  // Sort distinct dates ascending
  const sortedDates = Array.from(dateSet).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) continue;
    const currentDate = new Date(y, m - 1, d);

    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffMs = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = currentDate;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
};

export const getAllHabits = async (userId: number) => {
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        orderBy: { date: "desc" },
        take: 30, // include recent check-ins for calendar/streak view
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const today = getLocalDateString(new Date());

  return habits.map((habit) => {
    const completedToday = habit.logs.some((log) => log.date === today);
    return {
      ...habit,
      completedToday,
    };
  });
};

export const getHabitById = async (id: number, userId: number) => {
  const habit = await prisma.habit.findFirst({
    where: { id, userId },
    include: {
      logs: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!habit) return null;

  const today = getLocalDateString(new Date());
  const completedToday = habit.logs.some((log) => log.date === today);

  return {
    ...habit,
    completedToday,
  };
};

export const createHabit = async (userId: number, input: CreateHabitInput) => {
  return await prisma.habit.create({
    data: {
      name: input.name.trim(),
      frequency: input.frequency?.trim() || "DAILY",
      userId,
    },
  });
};

export const updateHabit = async (
  id: number,
  userId: number,
  input: UpdateHabitInput
) => {
  const existing = await prisma.habit.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const data: { name?: string; frequency?: string } = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.frequency !== undefined) data.frequency = input.frequency.trim();

  return await prisma.habit.update({
    where: { id },
    data,
  });
};

export const deleteHabit = async (id: number, userId: number) => {
  const existing = await prisma.habit.findFirst({ where: { id, userId } });
  if (!existing) return false;

  await prisma.habit.delete({ where: { id } });
  return true;
};

export const toggleHabitCheckIn = async (
  id: number,
  userId: number,
  dateStr?: string | undefined
) => {
  const habit = await prisma.habit.findFirst({
    where: { id, userId },
  });

  if (!habit) return null;

  const targetDate = dateStr || getLocalDateString(new Date());

  // Check if log already exists
  const existingLog = await prisma.habitLog.findUnique({
    where: {
      habitId_date: {
        habitId: id,
        date: targetDate,
      },
    },
  });

  let completedToday = false;

  if (existingLog) {
    // Uncheck / delete log
    await prisma.habitLog.delete({
      where: { id: existingLog.id },
    });
    completedToday = false;
  } else {
    // Check in / create log
    await prisma.habitLog.create({
      data: {
        habitId: id,
        date: targetDate,
      },
    });
    completedToday = true;
  }

  // Fetch all logs to recalculate streaks
  const allLogs = await prisma.habitLog.findMany({
    where: { habitId: id },
    select: { date: true },
  });

  const { currentStreak, longestStreak } = calculateStreaks(
    allLogs.map((l) => l.date)
  );

  const updatedHabit = await prisma.habit.update({
    where: { id },
    data: {
      currentStreak,
      longestStreak: Math.max(habit.longestStreak, longestStreak),
      lastCompletedAt: completedToday ? new Date() : habit.lastCompletedAt,
    },
    include: {
      logs: {
        orderBy: { date: "desc" },
        take: 30,
      },
    },
  });

  const todayStr = getLocalDateString(new Date());
  const isCheckedInToday = updatedHabit.logs.some((l) => l.date === todayStr);

  return {
    ...updatedHabit,
    completedToday: isCheckedInToday,
  };
};
