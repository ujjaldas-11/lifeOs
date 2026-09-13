import { Router } from "express";
import { getTasks, getTask, addTask, removeTask } from "../controllers/task.controller.js";


const router = Router();

router.get("/", getTasks);
router.get("/:id", getTask);
router.get("/", addTask);
router.get("/:d", removeTask);

export default router;