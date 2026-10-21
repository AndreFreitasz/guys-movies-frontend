const MIN_YEAR = 1800;
const MAX_YEAR = 2200;

export const formatYear = (
  date: string | number | null | undefined,
): string | null => {
  if (date === null || date === undefined || date === "") return null;

  const groups = String(date).match(/\d{4}/g);
  if (!groups) return null;

  const year = groups
    .map((group) => Number.parseInt(group, 10))
    .find((value) => value >= MIN_YEAR && value <= MAX_YEAR);

  return year === undefined ? null : String(year);
};
