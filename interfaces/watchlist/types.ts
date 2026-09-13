export type WatchlistItemType = "movie" | "serie";

export interface WatchlistProvider {
  id: number;
  name: string;
  logoPath: string | null;
}

export interface WatchlistItem {
  type: WatchlistItemType;
  idTmdb: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  addedAt: string;
  watched: boolean;
}

export interface WatchlistStats {
  total: number;
  movies: number;
  series: number;
}

export type AvailabilityStatus = "idle" | "loading" | "ready" | "failed";

export type ProvidersState =
  | { kind: "pending" }
  | { kind: "unknown" }
  | { kind: "empty" }
  | { kind: "available"; providers: WatchlistProvider[] };

export const resolveProvidersState = (
  status: AvailabilityStatus,
  failed: boolean,
  providers: WatchlistProvider[] | undefined,
): ProvidersState => {
  if (providers && providers.length > 0)
    return { kind: "available", providers };
  if (status === "idle" || status === "loading") return { kind: "pending" };
  if (status === "failed" || failed || !providers) return { kind: "unknown" };
  return { kind: "empty" };
};

export type WatchlistSort = "recent" | "oldest" | "rating" | "title";

export const WATCHLIST_SORTS: { value: WatchlistSort; label: string }[] = [
  { value: "recent", label: "Adicionado recentemente" },
  { value: "oldest", label: "Esperando há mais tempo" },
  { value: "rating", label: "Nota da TMDB" },
  { value: "title", label: "Título A-Z" },
];

export const availabilityKey = (type: WatchlistItemType, idTmdb: number) =>
  `${type}:${idTmdb}`;

export const FALLBACK_POSTER = "/icons/home/cinema.png";

export const resolvePosterUrl = (posterPath: string | null): string => {
  if (!posterPath) return FALLBACK_POSTER;
  if (posterPath.startsWith("http")) return posterPath;
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};
