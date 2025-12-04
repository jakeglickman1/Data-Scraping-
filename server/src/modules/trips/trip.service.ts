import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { parseJsonArray, stringifyJsonArray } from "../../utils/serialization";

export interface TripInput {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface HighlightInput {
  title: string;
  caption?: string;
  photos?: string[];
  occurredAt?: string;
}

const mapHighlight = (highlight: any) => ({
  ...highlight,
  photos: parseJsonArray(highlight.photos),
});

const mapTrip = (trip: any) => ({
  ...trip,
  highlights: trip.highlights?.map(mapHighlight) ?? [],
  visitedPlaces:
    trip.visitedPlaces?.map((place: any) => ({
      ...place,
      photos: parseJsonArray(place.photos),
    })) ?? [],
});

export const listTrips = async (userId: string) => {
  const trips = await prisma.trip.findMany({
    where: { userId },
    include: { highlights: true, visitedPlaces: true },
    orderBy: { startDate: "asc" },
  });
  return trips.map(mapTrip);
};

export const getTripById = async (userId: string, tripId: string) => {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: { highlights: true, visitedPlaces: true },
  });

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  return mapTrip(trip);
};

export const createTrip = async (userId: string, data: TripInput) => {
  const trip = await prisma.trip.create({
    data: {
      userId,
      destination: data.destination,
      country: data.country,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      notes: data.notes,
    },
  });
  return trip;
};

export const addHighlight = async (
  userId: string,
  tripId: string,
  data: HighlightInput,
) => {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  const highlight = await prisma.highlight.create({
    data: {
      tripId,
      title: data.title,
      caption: data.caption,
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : undefined,
      photos: stringifyJsonArray(data.photos ?? []),
    },
  });

  return mapHighlight(highlight);
};
