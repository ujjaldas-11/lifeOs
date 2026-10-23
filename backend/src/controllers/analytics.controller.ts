import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getActivityHeatmap,
  getWeeklyRetrospective,
} from "../services/analytics.service.js";

export const getHeatmap = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const days = Number(req.query.days) || 90;
    const heatmap = await getActivityHeatmap(userId, days);

    return res.status(200).json({
      success: true,
      data: heatmap,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch activity heatmap",
    });
  }
};

export const getRetrospective = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const retro = await getWeeklyRetrospective(userId);
    return res.status(200).json({
      success: true,
      data: retro,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch weekly retrospective",
    });
  }
};
