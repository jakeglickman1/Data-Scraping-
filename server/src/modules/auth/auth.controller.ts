import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types/http";
import * as authService from "./auth.service";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const signup = async (req: AuthRequest, res: Response) => {
  const data = credentialsSchema.parse(req.body);
  const result = await authService.signup(data);
  return res.status(201).json(result);
};

export const login = async (req: AuthRequest, res: Response) => {
  const data = credentialsSchema.omit({ name: true }).parse(req.body);
  const result = await authService.login(data);
  return res.json(result);
};
