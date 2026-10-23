import { Router } from "express";
import {
  getNotes,
  getNote,
  addNote,
  editNote,
  removeNote,
  getTags,
} from "../controllers/note.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/tags", getTags);
router.get("/", getNotes);
router.get("/:id", getNote);
router.post("/", addNote);
router.patch("/:id", editNote);
router.put("/:id", editNote);
router.delete("/:id", removeNote);

export default router;
