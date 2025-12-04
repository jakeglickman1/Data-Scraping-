import { env } from "../../config/env";

export interface FlightSearchInput {
  origin?: string;
  destination: string;
  startDate: string;
  endDate: string;
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

const mockFlights: FlightOption[] = [
  {
    id: "flt1",
    airline: "Wander Air",
    from: "SFO",
    to: "NRT",
    departure: "2025-03-12T09:15:00Z",
    arrival: "2025-03-12T18:05:00Z",
    durationHours: 10.8,
    price: 920,
  },
  {
    id: "flt2",
    airline: "Skyward Alliance",
    from: "SFO",
    to: "NRT",
    departure: "2025-03-12T14:45:00Z",
    arrival: "2025-03-13T00:15:00Z",
    durationHours: 11.5,
    price: 1010,
  },
];

export const searchFlights = async (
  params: FlightSearchInput,
): Promise<FlightOption[]> => {
  if (!env.FLIGHT_API_KEY) {
    return mockFlights.map((option, index) => ({
      ...option,
      id: `${option.id}-${params.destination}-${index}`,
      to: params.destination.toUpperCase(),
      departure: params.startDate,
      arrival: params.endDate,
    }));
  }

  // Placeholder for real API integration.
  // Here you would call the flight provider with fetch/axios and map the response.
  return mockFlights;
};
