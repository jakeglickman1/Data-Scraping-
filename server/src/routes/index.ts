import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import tripRoutes from "../modules/trips/trip.routes";
import wishlistRoutes from "../modules/wishlist/wishlist.routes";
import placeRoutes from "../modules/places/place.routes";
import advisorRoutes from "../modules/advisor/advisor.routes";
import plannerRoutes from "../modules/planner/planner.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/trips", tripRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/places", placeRoutes);
router.use("/advisor", advisorRoutes);
router.use("/trip-planner", plannerRoutes);

export default router;
