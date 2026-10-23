import { Router } from "express";
import { getHeatmap, getRetrospective } from "../controllers/analytics.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/heatmap", getHeatmap);
router.get("/retrospective", getRetrospective);

export default router;
