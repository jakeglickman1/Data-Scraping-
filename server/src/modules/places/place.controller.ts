import { Response } from "express";
import { AuthRequest } from "../../types/http";
import * as placeService from "./place.service";

export const getVisitedPlaces = async (req: AuthRequest, res: Response) => {
  const { tripId } = req.query as { tripId?: string };
  const places = await placeService.listVisitedPlaces(req.user!.id, tripId);
  res.json({ places });
};
