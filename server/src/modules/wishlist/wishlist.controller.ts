import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types/http";
import * as wishlistService from "./wishlist.service";
import { AppError } from "../../middleware/errorHandler";

const wishlistSchema = z.object({
  destination: z.string().min(2),
  country: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  visited: z.boolean().optional(),
});
const updateSchema = wishlistSchema.partial();

export const listItems = async (req: AuthRequest, res: Response) => {
  const items = await wishlistService.listItems(req.user!.id);
  res.json({ items });
};

export const createItem = async (req: AuthRequest, res: Response) => {
  const payload = wishlistSchema.parse(req.body);
  const item = await wishlistService.createItem(req.user!.id, payload);
  res.status(201).json({ item });
};

export const updateItem = async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError("Wishlist id is required", 400);
  }
  const payload = updateSchema.parse(req.body);
  const item = await wishlistService.updateItem(
    req.user!.id,
    id,
    payload,
  );
  res.json({ item });
};

export const deleteItem = async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError("Wishlist id is required", 400);
  }
  await wishlistService.deleteItem(req.user!.id, id);
  res.status(204).send();
};
