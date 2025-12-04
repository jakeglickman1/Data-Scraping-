import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as controller from "./planner.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authenticate);
router.post("/recommendations", asyncHandler(controller.createRecommendations));

export default router;
