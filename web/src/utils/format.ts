import { format, parseISO } from "date-fns";

export const formatDate = (value?: string | null) => {
  if (!value) return "TBD";
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch (err) {
    return value;
  }
};

export const formatCurrency = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
