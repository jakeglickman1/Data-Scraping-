import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as controller from "./trip.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(controller.listTrips));
router.get("/:id", asyncHandler(controller.getTrip));
router.post("/", asyncHandler(controller.createTrip));
router.post("/:id/highlights", asyncHandler(controller.addHighlight));

export default router;
