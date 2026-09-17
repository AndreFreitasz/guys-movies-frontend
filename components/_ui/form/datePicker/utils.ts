export const YEARS_PER_PAGE = 12;

export const toMonthIndex = (date: Date): number =>
  date.getFullYear() * 12 + date.getMonth();

export const fromMonthIndex = (index: number): Date =>
  new Date(Math.floor(index / 12), index % 12, 1);

export const clampToBounds = (
  date: Date,
  minIndex: number,
  maxIndex: number,
): Date => {
  const index = toMonthIndex(date);
  if (index < minIndex) return fromMonthIndex(minIndex);
  if (index > maxIndex) return fromMonthIndex(maxIndex);
  return date;
};

export const toYearPageStart = (year: number, minYear: number): number =>
  minYear + Math.floor((year - minYear) / YEARS_PER_PAGE) * YEARS_PER_PAGE;

export const capitalizeFirst = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);
