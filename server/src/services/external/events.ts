import { env } from "../../config/env";

export interface ActivityRecommendation {
  id: string;
  name: string;
  category: string;
  durationHours: number;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface EventRecommendation {
  id: string;
  name: string;
  venue: string;
  date: string;
  link?: string;
}

interface PlannerInput {
  destination: string;
  interests: string[];
}

const mockActivities: ActivityRecommendation[] = [
  {
    id: "act1",
    name: "Tsukiji Night Bites Tour",
    category: "Food",
    durationHours: 3,
    latitude: 35.665,
    longitude: 139.7708,
    description: "Sample late-night ramen and seafood classics.",
  },
  {
    id: "act2",
    name: "Neon District Photo Walk",
    category: "Nightlife",
    durationHours: 2,
    latitude: 35.6595,
    longitude: 139.7005,
    description: "Capture the iconic Shibuya crossing with a guide.",
  },
];

const mockEvents: EventRecommendation[] = [
  {
    id: "evt1",
    name: "Tokyo Jazz Collective",
    venue: "Blue Note",
    date: "2025-03-13T19:30:00Z",
    link: "https://example.com/events/blue-note",
  },
  {
    id: "evt2",
    name: "Spring Hanami Picnic",
    venue: "Ueno Park",
    date: "2025-03-15T10:00:00Z",
  },
];

export const fetchActivities = async ({
  destination,
  interests,
}: PlannerInput) => {
  if (!env.EVENTS_API_KEY) {
    return mockActivities.filter((activity) =>
      interests.length ? interests.includes(activity.category) : true,
    );
  }

  return mockActivities;
};

export const fetchEvents = async ({
  destination,
  interests,
}: PlannerInput) => {
  if (!env.EVENTS_API_KEY) {
    return mockEvents;
  }

  return mockEvents;
};
