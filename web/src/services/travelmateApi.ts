import { api } from "./api";
import type {
  AdvisorResponse,
  AuthResponse,
  PlannerResponse,
  Trip,
  WishlistItem,
  VisitedPlace,
} from "../types/api";

type TripHighlight = NonNullable<Trip["highlights"]>[number];

export const authService = {
  login: (payload: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", payload).then((res) => res.data),
  signup: (payload: { email: string; password: string; name?: string }) =>
    api.post<AuthResponse>("/auth/signup", payload).then((res) => res.data),
};

export const tripService = {
  list: () => api.get<{ trips: Trip[] }>("/trips").then((res) => res.data.trips),
  get: (id: string) => api.get<{ trip: Trip }>(`/trips/${id}`).then((res) => res.data.trip),
  create: (payload: {
    destination: string;
    country: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) => api.post<{ trip: Trip }>("/trips", payload).then((res) => res.data.trip),
  addHighlight: (tripId: string, payload: { title: string; caption?: string; photos?: string[] }) =>
    api.post<{ highlight: TripHighlight }>(`/trips/${tripId}/highlights`, payload).then((res) => res.data.highlight),
};

export const placeService = {
  visited: (tripId?: string) =>
    api.get<{ places: VisitedPlace[] }>("/places/visited", { params: { tripId } }).then((res) => res.data.places),
};

export const wishlistService = {
  list: () => api.get<{ items: WishlistItem[] }>("/wishlist").then((res) => res.data.items),
  create: (payload: { destination: string; country?: string; tags?: string[]; notes?: string }) =>
    api.post<{ item: WishlistItem }>("/wishlist", payload).then((res) => res.data.item),
  update: (id: string, payload: Partial<WishlistItem>) =>
    api.patch<{ item: WishlistItem }>(`/wishlist/${id}`, payload).then((res) => res.data.item),
  remove: (id: string) => api.delete(`/wishlist/${id}`),
};

export const plannerService = {
  recommend: (payload: { destination: string; startDate: string; endDate: string; interests: string[] }) =>
    api.post<PlannerResponse>("/trip-planner/recommendations", payload).then((res) => res.data),
};

export const advisorService = {
  search: (payload: {
    destination: string;
    startDate: string;
    endDate: string;
    travelers?: number;
    stayType?: string;
  }) => api.post<AdvisorResponse>("/advisor/search", payload).then((res) => res.data),
};
