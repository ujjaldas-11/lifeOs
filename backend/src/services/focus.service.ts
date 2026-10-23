import { prisma } from "../lib/prisma.js";
import type { LogFocusSessionInput } from "../models/model.focus.js";

export const logFocusSession = async (
  userId: number,
  input: LogFocusSessionInput
) => {
  return await prisma.focusSession.create({
    data: {
      durationMin: input.durationMin || 25,
      taskTitle: input.taskTitle?.trim() ?? null,
      taskId: input.taskId ?? null,
      userId,
    },
  });
};

export const getFocusSummary = async (userId: number) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [todaySessions, weekSessions, totalSessions, recentSessions] = await Promise.all([
    prisma.focusSession.findMany({
      where: {
        userId,
        completedAt: { gte: startOfToday },
      },
    }),
    prisma.focusSession.findMany({
      where: {
        userId,
        completedAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.focusSession.count({ where: { userId } }),
    prisma.focusSession.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 10,
    }),
  ]);

  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMin, 0);
  const weekMinutes = weekSessions.reduce((acc, s) => acc + s.durationMin, 0);

  return {
    todayMinutes,
    weekMinutes,
    todaySessionsCount: todaySessions.length,
    weekSessionsCount: weekSessions.length,
    totalSessionsCount: totalSessions,
    recentSessions,
  };
};
