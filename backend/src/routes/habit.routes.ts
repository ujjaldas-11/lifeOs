import { Router } from "express";
import {
  getHabits,
  getHabit,
  addHabit,
  editHabit,
  removeHabit,
  checkIn,
} from "../controllers/habit.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getHabits);
router.get("/:id", getHabit);
router.post("/", addHabit);
router.patch("/:id", editHabit);
router.put("/:id", editHabit);
router.delete("/:id", removeHabit);
router.post("/:id/checkin", checkIn);

export default router;
