import type { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
  exportAllUserData,
} from "../services/auth.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required",
      });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const authData = await registerUser(name, email, password);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: authData,
    });
  } catch (error: any) {
    const status = error.message.includes("already exists") ? 409 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to register user",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const authData = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: authData,
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid credentials",
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get user profile",
    });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, email, currentPassword, newPassword } = req.body;
    const updatedUser = await updateUserProfile(userId, {
      name,
      email,
      currentPassword,
      newPassword,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

export const exportData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const backup = await exportAllUserData(userId);
    return res.status(200).json({
      success: true,
      data: backup,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to export workspace data",
    });
  }
};
