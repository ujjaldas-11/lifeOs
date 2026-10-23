import { Router } from "express";
import {
  getTasks,
  getTask,
  addTask,
  updateTask,
  removeTask,
} from "../controllers/task.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all task routes with JWT authentication
router.use(authenticateToken);

router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", addTask);
router.patch("/:id", updateTask);
router.put("/:id", updateTask);
router.delete("/:id", removeTask);

export default router;