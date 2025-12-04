import { prisma } from "../../config/prisma";
import { parseJsonArray } from "../../utils/serialization";

export const listVisitedPlaces = async (userId: string, tripId?: string) => {
  const places = await prisma.visitedPlace.findMany({
    where: { userId, ...(tripId ? { tripId } : {}) },
  });

  return places.map((place) => ({
    ...place,
    photos: parseJsonArray(place.photos),
  }));
};
