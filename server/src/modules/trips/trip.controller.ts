import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types/http";
import * as tripService from "./trip.service";
import { AppError } from "../../middleware/errorHandler";

const tripSchema = z.object({
  destination: z.string().min(2),
  country: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  notes: z.string().optional(),
});

const highlightSchema = z.object({
  title: z.string().min(2),
  caption: z.string().optional(),
  photos: z.array(z.string()).optional(),
  occurredAt: z.string().optional(),
});

export const listTrips = async (req: AuthRequest, res: Response) => {
  const trips = await tripService.listTrips(req.user!.id);
  res.json({ trips });
};

export const getTrip = async (req: AuthRequest, res: Response) => {
  const tripId = req.params.id;
  if (!tripId) {
    throw new AppError("Trip id is required", 400);
  }
  const trip = await tripService.getTripById(req.user!.id, tripId);
  res.json({ trip });
};

export const createTrip = async (req: AuthRequest, res: Response) => {
  const payload = tripSchema.parse(req.body);
  const trip = await tripService.createTrip(req.user!.id, payload);
  res.status(201).json({ trip });
};

export const addHighlight = async (req: AuthRequest, res: Response) => {
  const tripId = req.params.id;
  if (!tripId) {
    throw new AppError("Trip id is required", 400);
  }
  const payload = highlightSchema.parse(req.body);
  const highlight = await tripService.addHighlight(
    req.user!.id,
    tripId,
    payload,
  );
  res.status(201).json({ highlight });
};
