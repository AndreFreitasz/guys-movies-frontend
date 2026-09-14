import { resolvePosterUrl } from "../watchlist/types";

export { resolvePosterUrl };

export type FavoriteType = "movie" | "serie";

export interface Favorite {
  type: FavoriteType;
  idTmdb: number;
  title: string;
  posterPath: string | null;
  year: number | null;
  position: number;
}

export interface ProfileCounts {
  followers: number;
  following: number;
  movies: number;
  episodes: number;
}

export interface Profile {
  id: number;
  username: string;
  name: string;
  bio: string | null;
  isSelf: boolean;
  isFollowing: boolean;
  followsYou: boolean;
  counts: ProfileCounts;
  favorites: Favorite[];
}

export interface UserSummary {
  username: string;
  name: string;
  isSelf: boolean;
  isFollowing: boolean;
}

export interface UserListPage {
  users: UserSummary[];
  nextCursor: string | null;
}

export type TimelineEvent =
  | {
      kind: "movie";
      idTmdb: number;
      title: string;
      posterPath: string | null;
      rating: number | null;
      occurredAt: string;
    }
  | {
      kind: "season";
      idTmdb: number;
      title: string;
      posterPath: string | null;
      seasonNumber: number;
      episodeCount: number;
      occurredAt: string;
    };

export interface TimelinePage {
  events: TimelineEvent[];
  nextCursor: string | null;
}

export interface UserStats {
  movies: number;
  series: number;
  episodes: number;
  serieRuntimeMinutes: number;
}

const GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-fuchsia-500 to-purple-600",
];

export const avatarGradient = (id: number): string =>
  GRADIENTS[Math.abs(id) % GRADIENTS.length];

export const initialsOf = (name: string, username: string): string => {
  const source = name.trim() || username.trim();
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const eventKey = (event: TimelineEvent): string =>
  event.kind === "movie"
    ? `movie:${event.idTmdb}:${event.occurredAt}`
    : `season:${event.idTmdb}:${event.seasonNumber}:${event.occurredAt}`;

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export const monthLabel = (isoDate: string): string => {
  const [year, month] = isoDate.split("-");
  const index = Number.parseInt(month, 10) - 1;
  if (index < 0 || index > 11) return isoDate;
  return `${MONTHS[index]} de ${year}`;
};

export const formatEventDate = (isoDate: string): string => {
  const [, month, day] = isoDate.split("-");
  const index = Number.parseInt(month, 10) - 1;
  if (index < 0 || index > 11) return isoDate;
  return `${Number.parseInt(day, 10)} de ${MONTHS[index]}`;
};
