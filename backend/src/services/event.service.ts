import { prisma } from "../lib/prisma.js";
import type { CreateEventInput, UpdateEventInput } from "../models/model.event.js";

export const getAllEvents = async (
  userId: number,
  filter: "all" | "upcoming" | "past" = "all"
) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const whereClause: any = { userId };

  if (filter === "upcoming") {
    whereClause.date = { gte: startOfToday };
  } else if (filter === "past") {
    whereClause.date = { lt: startOfToday };
  }

  const orderBy = filter === "past" ? { date: "desc" as const } : { date: "asc" as const };

  return await prisma.event.findMany({
    where: whereClause,
    orderBy,
  });
};

export const getEventById = async (id: number, userId: number) => {
  return await prisma.event.findFirst({
    where: { id, userId },
  });
};

export const createEvent = async (userId: number, input: CreateEventInput) => {
  const parsedDate = new Date(input.date);

  return await prisma.event.create({
    data: {
      title: input.title.trim(),
      description: input.description?.trim() ?? null,
      date: parsedDate,
      time: input.time?.trim() ?? null,
      userId,
    },
  });
};

export const updateEvent = async (
  id: number,
  userId: number,
  input: UpdateEventInput
) => {
  const existing = await prisma.event.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const data: any = {};
  if (input.title !== undefined) data.title = input.title.trim();
  if (input.description !== undefined) data.description = input.description?.trim() ?? null;
  if (input.date !== undefined) data.date = new Date(input.date);
  if (input.time !== undefined) data.time = input.time?.trim() ?? null;

  return await prisma.event.update({
    where: { id },
    data,
  });
};

export const deleteEvent = async (id: number, userId: number) => {
  const existing = await prisma.event.findFirst({ where: { id, userId } });
  if (!existing) return false;

  await prisma.event.delete({ where: { id } });
  return true;
};
