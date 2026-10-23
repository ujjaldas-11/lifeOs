import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getAllTags,
} from "../services/note.service.js";

export const getNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;

    const notes = await getAllNotes(userId, search, tag);

    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notes",
    });
  }
};

export const getNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    if (Number.isNaN(id) || !userId) {
      return res.status(400).json({ success: false, message: "Invalid note ID" });
    }

    const note = await getNoteById(id, userId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    return res.status(200).json({ success: true, data: note });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch note",
    });
  }
};

export const addNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { title, content, tags } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, message: "Note title is required" });
    }

    const note = await createNote(userId, {
      title,
      content,
      tags: Array.isArray(tags) ? tags : undefined,
    });

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create note",
    });
  }
};

export const editNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    if (Number.isNaN(id) || !userId) {
      return res.status(400).json({ success: false, message: "Invalid note ID" });
    }

    const { title, content, tags } = req.body;
    const updated = await updateNote(id, userId, {
      title,
      content,
      tags: Array.isArray(tags) ? tags : undefined,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update note",
    });
  }
};

export const removeNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.userId;
    if (Number.isNaN(id) || !userId) {
      return res.status(400).json({ success: false, message: "Invalid note ID" });
    }

    const deleted = await deleteNote(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete note",
    });
  }
};

export const getTags = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const tags = await getAllTags(userId);
    return res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tags",
    });
  }
};
