import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getAllHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitCheckIn,
} from "../services/habit.service.js";

export const getHabits = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const habits = await getAllHabits(userId);
    return res.status(200).json({
      success: true,
      count: habits.length,
      data: habits,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch habits",
    });
  }
};

export const getHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    if (Number.isNaN(id) || !userId) {
      return res.status(400).json({ success: false, message: "Invalid habit ID" });
    }

    const habit = await getHabitById(id, userId);
    if (!habit) {
      return res.status(404).json({ success: false, message: "Habit not found" });
    }

    return res.status(200).json({ success: true, data: habit });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch habit",
    });
  }
};

export const addHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, frequency } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Habit name is required" });
    }

    const habit = await createHabit(userId, { name, frequency });
    return res.status(201).json({
      success: true,
      message: "Habit created successfully",
      data: habit,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create habit",
    });
  }
};

export const editHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    if (Number.isNaN(id) || !userId) {
      return res.status(400).json({ success: false, message: "Invalid habit ID" });
    }

    const { name, frequency } = req.body;
    const updated = await updateHabit(id, userId, { name, frequency });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Habit not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Habit updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update habit",
    });
  }
};

export const removeHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    if (Number.isNaN(id) || !userId) {
      return res.status(400).json({ success: false, message: "Invalid habit ID" });
    }

    const deleted = await deleteHabit(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Habit not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Habit deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete habit",
    });
  }
};

export const checkIn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    if (Number.isNaN(id) || !userId) {
      return res.status(400).json({ success: false, message: "Invalid habit ID" });
    }

    const date = req.body?.date;
    const result = await toggleHabitCheckIn(id, userId, date);

    if (!result) {
      return res.status(404).json({ success: false, message: "Habit not found" });
    }

    return res.status(200).json({
      success: true,
      message: result.completedToday ? "Checked in successfully! 🔥" : "Check-in undone",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to check in habit",
    });
  }
};
