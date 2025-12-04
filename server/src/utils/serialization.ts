export const parseJsonArray = (value?: string | null): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const stringifyJsonArray = (value: string[]) => JSON.stringify(value ?? []);
