import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { parseJsonArray, stringifyJsonArray } from "../../utils/serialization";

export interface WishlistInput {
  destination: string;
  country?: string;
  tags?: string[];
  notes?: string;
  visited?: boolean;
}

const mapWishlistItem = (item: any) => ({
  ...item,
  tags: parseJsonArray(item.tags),
});

export const listItems = async (userId: string) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return items.map(mapWishlistItem);
};

export const createItem = async (userId: string, data: WishlistInput) => {
  const item = await prisma.wishlistItem.create({
    data: {
      userId,
      destination: data.destination,
      country: data.country,
      visited: data.visited ?? false,
      notes: data.notes,
      tags: stringifyJsonArray(data.tags ?? []),
    },
  });
  return mapWishlistItem(item);
};

export const updateItem = async (
  userId: string,
  itemId: string,
  data: Partial<WishlistInput>,
) => {
  const existing = await prisma.wishlistItem.findFirst({
    where: { id: itemId, userId },
  });
  if (!existing) {
    throw new AppError("Wishlist item not found", 404);
  }

  const updated = await prisma.wishlistItem.update({
    where: { id: itemId },
    data: {
      destination: data.destination ?? existing.destination,
      country: data.country ?? existing.country,
      visited: data.visited ?? existing.visited,
      notes: data.notes ?? existing.notes,
      tags:
        data.tags !== undefined
          ? stringifyJsonArray(data.tags)
          : existing.tags,
    },
  });

  return mapWishlistItem(updated);
};

export const deleteItem = async (userId: string, itemId: string) => {
  const existing = await prisma.wishlistItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!existing) {
    throw new AppError("Wishlist item not found", 404);
  }

  await prisma.wishlistItem.delete({ where: { id: itemId } });
  return { success: true };
};
