import { prisma } from "../lib/prisma.js";
import type { TaskPriority, TaskStatus } from "../models/model.task.js";

export const getAllTasks = async () => {
  return await prisma.task.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getTaskById = async (id: number) => {
  return await prisma.task.findUnique({
    where: {
      id,
    },
  });
};

export const createTask = async (
  title: string,
  description: string | undefined,
  priority: TaskPriority
) => {
  return await prisma.task.create({
    data: {
      title,
      description: description ?? null,
      priority: priority.toUpperCase() as "LOW" | "MEDIUM" | "HIGH",
    },
  });
};

export const updateTaskService = async (
  id: number,
  updates: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
  },
) => {
  const data: {
    title?: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    status?: "PENDING" | "COMPLETED";
  } = {};

  if(updates.title !== undefined) {
    data.title = updates.title;
  }
  
  if(updates.description !== undefined) {
    data.description = updates.description;
  }

   if (updates.priority !== undefined) {
    data.priority = updates.priority.toUpperCase() as
      | "LOW"
      | "MEDIUM"
      | "HIGH";
  }

  if (updates.status !== undefined) {
    data.status = updates.status.toUpperCase() as
      | "PENDING"
      | "COMPLETED";
  }


  return await prisma.task.update({
    where: {
        id,
    },
    data,
  });

};

export const deleteTask = async(id: number) => {
    try{
        await prisma.task.delete({
            where: {
                id,
            },
        });

        return true;
    } catch {
        return false;
    }
};
