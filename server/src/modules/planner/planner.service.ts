import { differenceInCalendarDays } from "date-fns";
import {
  ActivityRecommendation,
  EventRecommendation,
  fetchActivities,
  fetchEvents,
} from "../../services/external/events";

export interface PlannerInput {
  destination: string;
  startDate: string;
  endDate: string;
  interests: string[];
}

export interface PlannerResponse {
  destination: string;
  startDate: string;
  endDate: string;
  lengthOfStay: number;
  activities: ActivityRecommendation[];
  events: EventRecommendation[];
}

export const getRecommendations = async (
  params: PlannerInput,
): Promise<PlannerResponse> => {
  const lengthOfStay =
    differenceInCalendarDays(new Date(params.endDate), new Date(params.startDate)) +
    1;

  const [activities, events] = await Promise.all([
    fetchActivities({ destination: params.destination, interests: params.interests }),
    fetchEvents({ destination: params.destination, interests: params.interests }),
  ]);

  return {
    destination: params.destination,
    startDate: params.startDate,
    endDate: params.endDate,
    lengthOfStay,
    activities,
    events,
  };
};
