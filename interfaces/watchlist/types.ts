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

export const availabilityKey = (type: WatchlistItemType, idTmdb: number) =>
  `${type}:${idTmdb}`;

export const FALLBACK_POSTER = "/icons/home/cinema.png";

export const resolvePosterUrl = (posterPath: string | null): string => {
  if (!posterPath) return FALLBACK_POSTER;
  if (posterPath.startsWith("http")) return posterPath;
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};
