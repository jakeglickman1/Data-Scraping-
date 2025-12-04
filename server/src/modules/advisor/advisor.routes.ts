import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as controller from "./advisor.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authenticate);
router.post("/search", asyncHandler(controller.searchAdvisor));

export default router;
