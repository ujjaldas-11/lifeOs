import { prisma } from "../lib/prisma.js";
import type { TaskPriority, TaskStatus, TaskFilterType } from "../models/model.task.js";

export interface TaskFilterOptions {
  userId?: number | undefined;
  filter?: TaskFilterType | string | undefined;
  priority?: TaskPriority | string | undefined;
  search?: string | undefined;
  projectId?: number | undefined;
}

export const getAllTasks = async (options: TaskFilterOptions = {}) => {
  const { userId, filter = "all", priority, search, projectId } = options;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const whereClause: any = {};

  if (userId !== undefined) {
    whereClause.userId = userId;
  }

  if (projectId !== undefined) {
    whereClause.projectId = projectId;
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
      break;
  }

  return await prisma.task.findMany({
    where: whereClause,
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
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
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const createTask = async (data: {
  title: string;
  description?: string | null | undefined;
  priority?: TaskPriority | string | undefined;
  dueDate?: Date | string | null | undefined;
  completed?: boolean | undefined;
  userId?: number | null | undefined;
  projectId?: number | null | undefined;
  kanbanColumn?: string | undefined;
}) => {
  const normPriority = (data.priority?.toUpperCase() ?? "MEDIUM") as "LOW" | "MEDIUM" | "HIGH";
  const kanban = data.kanbanColumn ?? (data.completed ? "DONE" : "TODO");
  const isCompleted = data.completed !== undefined ? data.completed : kanban === "DONE";
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
      kanbanColumn: kanban,
      userId: data.userId ?? null,
      projectId: data.projectId ?? null,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
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
    projectId?: number | null | undefined;
    kanbanColumn?: string | undefined;
  },
  userId?: number | undefined
) => {
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

  if (updates.projectId !== undefined) {
    data.projectId = updates.projectId;
  }

  if (updates.kanbanColumn !== undefined) {
    data.kanbanColumn = updates.kanbanColumn;
    if (updates.kanbanColumn === "DONE" && updates.completed === undefined) {
      data.completed = true;
      data.status = "COMPLETED";
    } else if (
      (updates.kanbanColumn === "TODO" || updates.kanbanColumn === "IN_PROGRESS" || updates.kanbanColumn === "REVIEW") &&
      updates.completed === undefined &&
      existingTask.completed
    ) {
      data.completed = false;
      data.status = "PENDING";
    }
  }

  if (updates.completed !== undefined) {
    data.completed = updates.completed;
    data.status = updates.completed ? "COMPLETED" : "PENDING";
    if (updates.completed && updates.kanbanColumn === undefined) {
      data.kanbanColumn = "DONE";
    } else if (!updates.completed && existingTask.kanbanColumn === "DONE" && updates.kanbanColumn === undefined) {
      data.kanbanColumn = "TODO";
    }
  } else if (updates.status !== undefined) {
    const normStatus = updates.status.toUpperCase() as "PENDING" | "COMPLETED";
    data.status = normStatus;
    data.completed = normStatus === "COMPLETED";
    if (normStatus === "COMPLETED") data.kanbanColumn = "DONE";
  }

  return await prisma.task.update({
    where: { id },
    data,
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
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
