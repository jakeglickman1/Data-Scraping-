import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as controller from "./place.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authenticate);
router.get("/visited", asyncHandler(controller.getVisitedPlaces));

export default router;
