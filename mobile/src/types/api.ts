export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Highlight {
  id: string;
  title: string;
  caption?: string | null;
  photos: string[];
  occurredAt?: string | null;
}

export interface VisitedPlace {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  visitDate?: string | null;
  caption?: string | null;
  photos: string[];
  tripId?: string | null;
}

export interface Trip {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  notes?: string | null;
  highlights?: Highlight[];
  visitedPlaces?: VisitedPlace[];
}

export interface WishlistItem {
  id: string;
  destination: string;
  country?: string | null;
  tags: string[];
  visited: boolean;
  notes?: string | null;
}

export interface PlannerActivity {
  id: string;
  name: string;
  category: string;
  durationHours: number;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface PlannerEvent {
  id: string;
  name: string;
  venue: string;
  date: string;
  link?: string;
}

export interface PlannerResponse {
  destination: string;
  startDate: string;
  endDate: string;
  lengthOfStay: number;
  activities: PlannerActivity[];
  events: PlannerEvent[];
}

export interface FlightOption {
  id: string;
  airline: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  durationHours: number;
  price: number;
}

export interface HotelOption {
  id: string;
  name: string;
  neighborhood: string;
  rating: number;
  pricePerNight: number;
  totalPrice: number;
  imageUrl: string;
}

export interface AdvisorResponse {
  flights: FlightOption[];
  hotels: HotelOption[];
  notes: string[];
}
