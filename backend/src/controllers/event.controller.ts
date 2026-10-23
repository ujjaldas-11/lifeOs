import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../services/event.service.js";

export const getEvents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const filter = (req.query.filter as "all" | "upcoming" | "past") || "all";
    const events = await getAllEvents(userId, filter);

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch events",
    });
  }
};

export const getEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    if (Number.isNaN(id) || !userId) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await getEventById(id, userId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.status(200).json({ success: true, data: event });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch event",
    });
  }
};

export const addEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { title, description, date, time } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, message: "Event title is required" });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: "Event date is required" });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid event date format" });
    }

    const event = await createEvent(userId, {
      title,
      description,
      date: parsedDate,
      time,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create event",
    });
  }
};

export const editEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    if (Number.isNaN(id) || !userId) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const { title, description, date, time } = req.body;

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid event date format" });
      }
    }

    const updated = await updateEvent(id, userId, {
      title,
      description,
      date,
      time,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update event",
    });
  }
};

export const removeEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    if (Number.isNaN(id) || !userId) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const deleted = await deleteEvent(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete event",
    });
  }
};
