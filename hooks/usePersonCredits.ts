import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  MediaType,
  PersonCredit,
  PersonCreditsPage,
} from "../interfaces/person/types";

export type CreditSort = "relevance" | "year" | "rating";
export type MediaFilter = MediaType | "all";
type Status = "ready" | "loading" | "failed";

interface Options {
  personId: number;
  initialPage: PersonCreditsPage;
  defaultDepartment: string;
  departments: string[];
}

const MEDIA_VALUES: MediaFilter[] = ["all", "movie", "tv"];
const SORT_VALUES: CreditSort[] = ["relevance", "year", "rating"];

const readUrlQuery = (): URLSearchParams =>
  typeof window === "undefined"
    ? new URLSearchParams()
    : new URLSearchParams(window.location.search);

const resolveInitialDepartment = (
  value: string | null,
  departments: string[],
  fallback: string,
): string => (value && departments.includes(value) ? value : fallback);

const resolveInitialMedia = (value: string | null): MediaFilter =>
  value && (MEDIA_VALUES as string[]).includes(value)
    ? (value as MediaFilter)
    : "all";

const resolveInitialSort = (value: string | null): CreditSort =>
  value && (SORT_VALUES as string[]).includes(value)
    ? (value as CreditSort)
    : "relevance";

const resolveInitialGenre = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const usePersonCredits = ({
  personId,
  initialPage,
  defaultDepartment,
  departments,
}: Options) => {
  const router = useRouter();

  const [department, setDepartmentState] = useState(defaultDepartment);
  const [media, setMediaState] = useState<MediaFilter>("all");
  const [sort, setSortState] = useState<CreditSort>("relevance");
  const [genre, setGenreState] = useState<number | null>(null);

  const [items, setItems] = useState<PersonCredit[]>(initialPage.items);
  const [page, setPage] = useState(initialPage.page);
  const [totalPages, setTotalPages] = useState(initialPage.totalPages);
  const [total, setTotal] = useState(initialPage.total);
  const [status, setStatus] = useState<Status>("ready");

  const requestRef = useRef(0);
  const isFirstRun = useRef(true);

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;
      setStatus("loading");

      try {
        const params = new URLSearchParams({
          department,
          media,
          sort,
          page: String(nextPage),
        });
        if (genre !== null) params.set("genre", String(genre));

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/person/${personId}/credits?${params.toString()}`,
        );

        if (!response.ok) throw new Error("Falha ao carregar a filmografia");

        const data = (await response.json()) as PersonCreditsPage;
        if (requestRef.current !== requestId) return;

        setItems((current) =>
          append ? [...current, ...data.items] : data.items,
        );
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setStatus("ready");
      } catch {
        if (requestRef.current !== requestId) return;
        setStatus("failed");
      }
    },
    [department, genre, media, personId, sort],
  );

  useEffect(() => {
    const query = readUrlQuery();
    const seededDepartment = resolveInitialDepartment(
      query.get("departamento"),
      departments,
      defaultDepartment,
    );
    const seededMedia = resolveInitialMedia(query.get("midia"));
    const seededSort = resolveInitialSort(query.get("ordem"));
    const seededGenre = resolveInitialGenre(query.get("genero"));

    const hasUrlOverride =
      seededDepartment !== defaultDepartment ||
      seededMedia !== "all" ||
      seededSort !== "relevance" ||
      seededGenre !== null;

    if (!hasUrlOverride) return;

    setDepartmentState(seededDepartment);
    setMediaState(seededMedia);
    setSortState(seededSort);
    setGenreState(seededGenre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    fetchPage(1, false);

    const query: Record<string, string> = { id: String(personId) };
    if (department !== defaultDepartment) query.departamento = department;
    if (media !== "all") query.midia = media;
    if (sort !== "relevance") query.ordem = sort;
    if (genre !== null) query.genero = String(genre);

    router.replace({ pathname: "/pessoa/[id]", query }, undefined, {
      shallow: true,
    });
  }, [department, genre, media, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (status === "loading" || page >= totalPages) return;
    fetchPage(page + 1, true);
  }, [fetchPage, page, status, totalPages]);

  return {
    items,
    department,
    media,
    sort,
    genre,
    total,
    status,
    hasMore: page < totalPages,
    setDepartment: setDepartmentState,
    setMedia: setMediaState,
    setSort: setSortState,
    setGenre: setGenreState,
    loadMore,
    retry: () => fetchPage(1, false),
  };
};
