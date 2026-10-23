import { Router } from "express";
import {
  getProjects,
  getProject,
  addProject,
  editProject,
  removeProject,
} from "../controllers/project.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", addProject);
router.patch("/:id", editProject);
router.put("/:id", editProject);
router.delete("/:id", removeProject);

export default router;
