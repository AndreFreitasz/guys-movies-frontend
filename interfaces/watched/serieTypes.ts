export interface WatchedSerieItem {
  idTmdb: number;
  name: string | null;
  overview: string | null;
  posterPath: string | null;
  firstAirDate: string | null;
  numberOfSeasons: number | null;
  voteAverage: number | null;
  rating: number | null;
  watchedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  watchedSeasons: number;
  watchedEpisodes: number;
  episodeRunTime: number | null;
}

export interface WatchedSerieStats {
  total: number;
  completed: number;
  inProgress: number;
  seasons: number;
  episodes: number;
  runtimeMinutes: number;
  averageRating: number | null;
  lastActivityAt: string | null;
}

export interface WatchedSerieList {
  items: WatchedSerieItem[];
  stats: WatchedSerieStats;
}

export type WatchedSerieSortKey = "recent" | "rating" | "title" | "progress";
