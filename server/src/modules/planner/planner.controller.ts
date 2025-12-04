import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types/http";
import * as plannerService from "./planner.service";

const plannerSchema = z.object({
  destination: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  interests: z.array(z.string()).default([]),
});

export const createRecommendations = async (
  req: AuthRequest,
  res: Response,
) => {
  const payload = plannerSchema.parse(req.body);
  const response = await plannerService.getRecommendations(payload);
  res.json(response);
};
