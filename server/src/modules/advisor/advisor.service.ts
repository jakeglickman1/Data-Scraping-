import { searchFlights } from "../../services/external/flights";
import { searchHotels } from "../../services/external/hotels";

export interface AdvisorInput {
  destination: string;
  startDate: string;
  endDate: string;
  travelers?: number;
  stayType?: string;
}

export const runAdvisorSearch = async (params: AdvisorInput) => {
  const [flights, hotels] = await Promise.all([
    searchFlights({
      origin: "SFO",
      destination: params.destination,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
    searchHotels({
      destination: params.destination,
      startDate: params.startDate,
      endDate: params.endDate,
      stayType: params.stayType,
    }),
  ]);

  const notes = [
    `Plan for ${params.travelers ?? 1} traveler(s).`,
    params.stayType
      ? `Showing ${params.stayType} stays; adjust in settings for more results.`
      : "Update stay type to fine-tune hotel results.",
  ];

  return { flights, hotels, notes };
};
