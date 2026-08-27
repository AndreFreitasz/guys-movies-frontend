export interface WatchedMovieItem {
  idTmdb: number;
  title: string | null;
  overview: string | null;
  posterPath: string | null;
  releaseDate: string | null;
  director: string | null;
  voteAverage: number | null;
  rating: number | null;
  watchedAt: string | null;
  createdAt: string;
}

export interface WatchedMovieStats {
  total: number;
  rated: number;
  averageRating: number | null;
  lastWatchedAt: string | null;
}

export interface WatchedMovieList {
  items: WatchedMovieItem[];
  stats: WatchedMovieStats;
}

export type WatchedSortKey = "recent" | "rating" | "title" | "release";
