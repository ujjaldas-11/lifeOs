import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  exportData,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);
router.put("/profile", authenticateToken, updateProfile);
router.get("/export", authenticateToken, exportData);

export default router;
