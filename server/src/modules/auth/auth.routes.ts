import { Router } from "express";
import * as controller from "./auth.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/signup", asyncHandler(controller.signup));
router.post("/login", asyncHandler(controller.login));

export default router;
