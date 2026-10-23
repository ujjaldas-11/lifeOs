import { prisma } from "../lib/prisma.js";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectStatus,
} from "../models/model.project.js";

export const getAllProjects = async (
  userId: number,
  status?: ProjectStatus | undefined
) => {
  const whereClause: any = { userId };
  if (status) {
    whereClause.status = status;
  }

  const projects = await prisma.project.findMany({
    where: whereClause,
    include: {
      tasks: {
        select: {
          id: true,
          completed: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects.map((p) => {
    const tasksCount = p.tasks.length;
    const completedTasksCount = p.tasks.filter((t) => t.completed).length;
    const progressPercentage =
      tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0;

    const { tasks: _, ...projectWithoutTasks } = p;
    return {
      ...projectWithoutTasks,
      tasksCount,
      completedTasksCount,
      progressPercentage,
    };
  });
};

export const getProjectById = async (id: number, userId: number) => {
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      tasks: {
        orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
      },
      notes: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!project) return null;

  const tasksCount = project.tasks.length;
  const completedTasksCount = project.tasks.filter((t) => t.completed).length;
  const progressPercentage =
    tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0;

  return {
    ...project,
    tasksCount,
    completedTasksCount,
    progressPercentage,
  };
};

export const createProject = async (
  userId: number,
  input: CreateProjectInput
) => {
  const cleanStack = input.techStack
    ? Array.from(new Set(input.techStack.map((s) => s.trim()).filter(Boolean)))
    : [];

  return await prisma.project.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      techStack: cleanStack,
      githubUrl: input.githubUrl?.trim() ?? null,
      status: input.status ?? "ACTIVE",
      userId,
    },
  });
};

export const updateProject = async (
  id: number,
  userId: number,
  input: UpdateProjectInput
) => {
  const existing = await prisma.project.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const data: any = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.description !== undefined)
    data.description = input.description?.trim() ?? null;
  if (input.techStack !== undefined) {
    data.techStack = Array.from(
      new Set(input.techStack.map((s) => s.trim()).filter(Boolean))
    );
  }
  if (input.githubUrl !== undefined)
    data.githubUrl = input.githubUrl?.trim() ?? null;
  if (input.status !== undefined) data.status = input.status;

  return await prisma.project.update({
    where: { id },
    data,
  });
};

export const deleteProject = async (id: number, userId: number) => {
  const existing = await prisma.project.findFirst({ where: { id, userId } });
  if (!existing) return false;

  await prisma.project.delete({ where: { id } });
  return true;
};
