import { useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import type { ParsedUrlQuery } from "querystring";

export type RatingRangeFilter = { min: number; max: number } | "none" | null;

const RATING_MIN = 0.5;
const RATING_MAX = 5;
const RATING_STEP = 0.5;

const isHalfStepValue = (value: number): boolean =>
  Number.isFinite(value) &&
  Math.abs(value / RATING_STEP - Math.round(value / RATING_STEP)) < 1e-9;

const parseNumbers = (value: string | string[] | undefined): number[] => {
  if (typeof value !== "string" || value.length === 0) return [];
  return value
    .split(",")
    .map((item) => Number.parseInt(item, 10))
    .filter((item) => Number.isInteger(item));
};

const parseStrings = (value: string | string[] | undefined): string[] => {
  if (typeof value !== "string" || value.length === 0) return [];
  return value.split(",").filter((item) => item.length > 0);
};

const parseRating = (
  value: string | string[] | undefined,
): RatingRangeFilter => {
  if (typeof value !== "string" || value.length === 0) return null;
  if (value === "none") return "none";

  const match = /^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/.exec(value);
  if (!match) return null;

  const min = Number.parseFloat(match[1]);
  const max = Number.parseFloat(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  if (min > max) return null;
  if (min < RATING_MIN || max > RATING_MAX) return null;
  if (!isHalfStepValue(min) || !isHalfStepValue(max)) return null;

  return { min, max };
};

const formatRating = (value: RatingRangeFilter): string | undefined => {
  if (value === null) return undefined;
  if (value === "none") return "none";
  return `${value.min}-${value.max}`;
};

const parseDecade = (value: string | string[] | undefined): number | null => {
  if (typeof value !== "string" || value.length === 0) return null;
  const decade = Number.parseInt(value, 10);
  if (!Number.isInteger(decade) || decade % 10 !== 0) return null;
  return decade;
};

export const useWatchedFilters = () => {
  const router = useRouter();
  const pendingQueryRef = useRef<ParsedUrlQuery | null>(null);

  const rating = useMemo(
    () => parseRating(router.query.rating),
    [router.query.rating],
  );
  const decade = useMemo(
    () => parseDecade(router.query.decade),
    [router.query.decade],
  );
  const directors = useMemo(
    () => parseStrings(router.query.directors),
    [router.query.directors],
  );
  const providers = useMemo(
    () => parseNumbers(router.query.providers),
    [router.query.providers],
  );

  const replaceQuery = useCallback(
    (patch: Record<string, string | undefined>) => {
      if (!router.isReady) return;

      const base = pendingQueryRef.current ?? router.query;
      const next: ParsedUrlQuery = { ...base, ...patch };
      Object.keys(next).forEach((key) => {
        if (!next[key]) delete next[key];
      });
      pendingQueryRef.current = next;
      void router
        .replace({ query: next }, undefined, { shallow: true, scroll: false })
        .catch(() => {})
        .finally(() => {
          if (pendingQueryRef.current === next) pendingQueryRef.current = null;
        });
    },
    [router],
  );

  const activeCount =
    (rating !== null ? 1 : 0) +
    (decade !== null ? 1 : 0) +
    directors.length +
    providers.length;

  const setRating = useCallback(
    (value: RatingRangeFilter) => replaceQuery({ rating: formatRating(value) }),
    [replaceQuery],
  );
  const setDecade = useCallback(
    (value: number | null) =>
      replaceQuery({ decade: value === null ? undefined : String(value) }),
    [replaceQuery],
  );
  const setDirectors = useCallback(
    (value: string[]) => replaceQuery({ directors: value.join(",") }),
    [replaceQuery],
  );
  const setProviders = useCallback(
    (value: number[]) => replaceQuery({ providers: value.join(",") }),
    [replaceQuery],
  );
  const clearAll = useCallback(
    () =>
      replaceQuery({
        rating: undefined,
        decade: undefined,
        directors: undefined,
        providers: undefined,
        ratings: undefined,
      }),
    [replaceQuery],
  );

  return {
    rating,
    decade,
    directors,
    providers,
    setRating,
    setDecade,
    setDirectors,
    setProviders,
    activeCount,
    clearAll,
    isReady: router.isReady,
  };
};
