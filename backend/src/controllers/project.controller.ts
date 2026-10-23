import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../services/project.service.js";
import type { ProjectStatus } from "../models/model.project.js";

export const getProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const status = req.query.status as ProjectStatus | undefined;
    const projects = await getAllProjects(userId, status);

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch projects",
    });
  }
};

export const getProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    if (Number.isNaN(id) || !userId) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }

    const project = await getProjectById(id, userId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch project",
    });
  }
};

export const addProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, description, techStack, githubUrl, status } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    const project = await createProject(userId, {
      name,
      description,
      techStack,
      githubUrl,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create project",
    });
  }
};

export const editProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    if (Number.isNaN(id) || !userId) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }

    const { name, description, techStack, githubUrl, status } = req.body;
    const updated = await updateProject(id, userId, {
      name,
      description,
      techStack,
      githubUrl,
      status,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update project",
    });
  }
};

export const removeProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    if (Number.isNaN(id) || !userId) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }

    const deleted = await deleteProject(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete project",
    });
  }
};
