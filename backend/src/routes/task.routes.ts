import { Router } from "express";
import { getTasks, getTask, addTask, removeTask, updateTask } from "../controllers/task.controller.js";


const router = Router();

router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", addTask);
router.patch("/:id", updateTask);
router.delete("/:id", removeTask);

export default router;      