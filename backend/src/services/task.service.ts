import { prisma } from "../lib/prisma.js";
import type { TaskPriority, TaskStatus, TaskFilterType } from "../models/model.task.js";

export interface TaskFilterOptions {
  userId?: number | undefined;
  filter?: TaskFilterType | string | undefined;
  priority?: TaskPriority | string | undefined;
  search?: string | undefined;
}

export const getAllTasks = async (options: TaskFilterOptions = {}) => {
  const { userId, filter = "all", priority, search } = options;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const whereClause: any = {};

  if (userId !== undefined) {
    whereClause.userId = userId;
  }

  if (priority) {
    whereClause.priority = priority.toUpperCase() as "LOW" | "MEDIUM" | "HIGH";
  }

  if (search && search.trim() !== "") {
    whereClause.OR = [
      { title: { contains: search.trim(), mode: "insensitive" } },
      { description: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  switch (filter?.toLowerCase()) {
    case "today":
      whereClause.dueDate = {
        gte: startOfToday,
        lte: endOfToday,
      };
      break;

    case "upcoming":
      whereClause.dueDate = {
        gt: endOfToday,
      };
      whereClause.completed = false;
      break;

    case "overdue":
      whereClause.dueDate = {
        lt: startOfToday,
      };
      whereClause.completed = false;
      break;

    case "completed":
      whereClause.completed = true;
      break;

    case "all":
    default:
      // No filter applied
      break;
  }

  return await prisma.task.findMany({
    where: whereClause,
    orderBy: [
      { completed: "asc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  });
};

export const getTaskById = async (id: number, userId?: number) => {
  const whereClause: { id: number; userId?: number } = { id };
  if (userId !== undefined) {
    whereClause.userId = userId;
  }

  return await prisma.task.findFirst({
    where: whereClause,
  });
};

export const createTask = async (data: {
  title: string;
  description?: string | null | undefined;
  priority?: TaskPriority | string | undefined;
  dueDate?: Date | string | null | undefined;
  completed?: boolean | undefined;
  userId?: number | null | undefined;
}) => {
  const normPriority = (data.priority?.toUpperCase() ?? "MEDIUM") as "LOW" | "MEDIUM" | "HIGH";
  const isCompleted = data.completed ?? false;
  const status: "PENDING" | "COMPLETED" = isCompleted ? "COMPLETED" : "PENDING";
  const dueDateVal = data.dueDate ? new Date(data.dueDate) : null;

  return await prisma.task.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() ?? null,
      priority: normPriority,
      dueDate: dueDateVal,
      completed: isCompleted,
      status,
      userId: data.userId ?? null,
    },
  });
};

export const updateTaskService = async (
  id: number,
  updates: {
    title?: string | undefined;
    description?: string | null | undefined;
    priority?: TaskPriority | string | undefined;
    dueDate?: Date | string | null | undefined;
    completed?: boolean | undefined;
    status?: TaskStatus | string | undefined;
  },
  userId?: number | undefined
) => {
  // First verify task exists and belongs to user if specified
  const existingTask = await getTaskById(id, userId);
  if (!existingTask) {
    return null;
  }

  const data: any = {};

  if (updates.title !== undefined) {
    data.title = updates.title.trim();
  }

  if (updates.description !== undefined) {
    data.description = updates.description?.trim() ?? null;
  }

  if (updates.priority !== undefined) {
    data.priority = updates.priority.toUpperCase() as "LOW" | "MEDIUM" | "HIGH";
  }

  if (updates.dueDate !== undefined) {
    data.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
  }

  if (updates.completed !== undefined) {
    data.completed = updates.completed;
    data.status = updates.completed ? "COMPLETED" : "PENDING";
  } else if (updates.status !== undefined) {
    const normStatus = updates.status.toUpperCase() as "PENDING" | "COMPLETED";
    data.status = normStatus;
    data.completed = normStatus === "COMPLETED";
  }

  return await prisma.task.update({
    where: { id },
    data,
  });
};

export const deleteTask = async (id: number, userId?: number) => {
  try {
    const existingTask = await getTaskById(id, userId);
    if (!existingTask) {
      return false;
    }

    await prisma.task.delete({
      where: { id },
    });

    return true;
  } catch {
    return false;
  }
};
