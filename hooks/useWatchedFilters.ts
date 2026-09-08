import { useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import type { ParsedUrlQuery } from "querystring";

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

export const useWatchedFilters = () => {
  const router = useRouter();
  const pendingQueryRef = useRef<ParsedUrlQuery | null>(null);

  const ratings = useMemo(
    () => parseNumbers(router.query.ratings),
    [router.query.ratings],
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
      const base = pendingQueryRef.current ?? router.query;
      const next: ParsedUrlQuery = { ...base, ...patch };
      Object.keys(next).forEach((key) => {
        if (!next[key]) delete next[key];
      });
      pendingQueryRef.current = next;
      void router
        .replace({ query: next }, undefined, { shallow: true })
        .catch(() => {})
        .finally(() => {
          if (pendingQueryRef.current === next) pendingQueryRef.current = null;
        });
    },
    [router],
  );

  const activeCount = ratings.length + directors.length + providers.length;

  const setRatings = useCallback(
    (value: number[]) => replaceQuery({ ratings: value.join(",") }),
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
        ratings: undefined,
        directors: undefined,
        providers: undefined,
      }),
    [replaceQuery],
  );

  return {
    ratings,
    directors,
    providers,
    setRatings,
    setDirectors,
    setProviders,
    activeCount,
    clearAll,
    isReady: router.isReady,
  };
};
