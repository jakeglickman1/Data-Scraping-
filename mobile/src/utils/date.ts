import { format, parseISO } from "date-fns";

export const formatRange = (start: string, end: string) =>
  `${format(parseISO(start), "MMM d")} - ${format(parseISO(end), "MMM d, yyyy")}`;

export const formatDay = (date: string) =>
  format(parseISO(date), "EEE, MMM d");
