import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTaskService,
  deleteTask,
} from "../services/task.service.js";

const VALID_PRIORITIES = ["low", "medium", "high", "LOW", "MEDIUM", "HIGH"];

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filter, priority, search, projectId } = req.query;
    const userId = req.user?.userId;

    const tasks = await getAllTasks({
      userId,
      filter: typeof filter === "string" ? filter : undefined,
      priority: typeof priority === "string" ? priority : undefined,
      search: typeof search === "string" ? search : undefined,
      projectId: projectId ? Number(projectId) : undefined,
    });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve tasks",
    });
  }
};

export const getTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const userId = req.user?.userId;
    const task = await getTaskById(id, userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve task",
    });
  }
};

export const addTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, priority, dueDate, completed, projectId, kanbanColumn } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be low, medium, or high",
      });
    }

    let parsedDueDate: Date | null = null;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
      if (Number.isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date format",
        });
      }
    }

    const task = await createTask({
      title,
      description,
      priority,
      dueDate: parsedDueDate,
      completed: typeof completed === "boolean" ? completed : undefined,
      projectId: projectId !== undefined ? (projectId === null ? null : Number(projectId)) : undefined,
      kanbanColumn: typeof kanbanColumn === "string" ? kanbanColumn : undefined,
      userId: req.user?.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create task",
    });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const { title, description, priority, dueDate, completed, status, projectId, kanbanColumn } = req.body;

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be low, medium, or high",
      });
    }

    if (dueDate !== undefined && dueDate !== null) {
      const parsed = new Date(dueDate);
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date format",
        });
      }
    }

    const updatedTask = await updateTaskService(
      id,
      {
        title,
        description,
        priority,
        dueDate,
        completed,
        status,
        projectId: projectId !== undefined ? (projectId === null ? null : Number(projectId)) : undefined,
        kanbanColumn: typeof kanbanColumn === "string" ? kanbanColumn : undefined,
      },
      req.user?.userId
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update task",
    });
  }
};

export const removeTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const deleted = await deleteTask(id, req.user?.userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete task",
    });
  }
};
