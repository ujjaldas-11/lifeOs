import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { logFocusSession, getFocusSummary } from "../services/focus.service.js";

export const addFocusSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { durationMin, taskTitle, taskId } = req.body;
    const session = await logFocusSession(userId, {
      durationMin: Number(durationMin) || 25,
      taskTitle,
      taskId: taskId ? Number(taskId) : undefined,
    });

    return res.status(201).json({
      success: true,
      message: "Focus session logged! ⚡",
      data: session,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to log focus session",
    });
  }
};

export const getFocusOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const summary = await getFocusSummary(userId);
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch focus summary",
    });
  }
};
