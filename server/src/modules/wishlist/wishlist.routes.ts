import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as controller from "./wishlist.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(controller.listItems));
router.post("/", asyncHandler(controller.createItem));
router.patch("/:id", asyncHandler(controller.updateItem));
router.delete("/:id", asyncHandler(controller.deleteItem));

export default router;
