import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types/http";
import * as advisorService from "./advisor.service";

const advisorSchema = z.object({
  destination: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  travelers: z.number().min(1).default(1).optional(),
  stayType: z.string().optional(),
});

export const searchAdvisor = async (req: AuthRequest, res: Response) => {
  const payload = advisorSchema.parse(req.body);
  const response = await advisorService.runAdvisorSearch(payload);
  res.json(response);
};
