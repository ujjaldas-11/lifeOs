import { Router } from "express";
import { addFocusSession, getFocusOverview } from "../controllers/focus.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.post("/", addFocusSession);
router.get("/summary", getFocusOverview);

export default router;
