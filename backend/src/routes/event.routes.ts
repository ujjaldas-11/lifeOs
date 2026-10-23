import { Router } from "express";
import {
  getEvents,
  getEvent,
  addEvent,
  editEvent,
  removeEvent,
} from "../controllers/event.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/", addEvent);
router.patch("/:id", editEvent);
router.put("/:id", editEvent);
router.delete("/:id", removeEvent);

export default router;
