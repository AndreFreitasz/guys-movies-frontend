export type MediaType = "movie" | "tv";

export interface PersonCredit {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  year: number | null;
  voteAverage: number | null;
  voteCount: number;
  genreIds: number[];
  role: string;
  department: string;
}

export interface DepartmentSummary {
  key: string;
  label: string;
  count: number;
}

export interface GenreCount {
  id: number;
  name: string;
  count: number;
}

export interface PersonStats {
  totalTitles: number;
  firstYear: number | null;
  lastYear: number | null;
  topGenre: string | null;
  bestRated: PersonCredit | null;
}

export interface PersonCreditsPage {
  items: PersonCredit[];
  page: number;
  totalPages: number;
  total: number;
}

export interface PersonProfile {
  id: number;
  name: string;
  profilePath: string | null;
  biography: string | null;
  biographyLanguage: "pt" | "en" | null;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  knownForDepartment: string | null;
  departments: DepartmentSummary[];
  genres: GenreCount[];
  stats: PersonStats;
  highlights: PersonCredit[];
  defaultDepartment: string;
  movieIds: number[];
  credits: PersonCreditsPage;
}

export interface ArtistSearchResult {
  id: number;
  name: string;
  profilePath: string | null;
  knownForDepartment: string | null;
  knownFor: string[];
}

export type TmdbPosterSize = "w92" | "w154" | "w185" | "w342" | "w500";
export type TmdbProfileSize = "w45" | "w185" | "h632";

const tmdbImage = (path: string | null, size: string): string | null =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export const tmdbPoster = (
  path: string | null,
  size: TmdbPosterSize,
): string | null => tmdbImage(path, size);

export const tmdbProfile = (
  path: string | null,
  size: TmdbProfileSize,
): string | null => tmdbImage(path, size);

export const creditHref = (credit: PersonCredit): string =>
  credit.mediaType === "tv" ? `/serie/${credit.id}` : `/movie/${credit.id}`;

interface IsoDateParts {
  year: number;
  month: number;
  day: number;
}

const parseIsoDateParts = (value: string): IsoDateParts | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  };
};

export const personAge = (
  birthday: string | null,
  deathday: string | null,
): number | null => {
  if (!birthday) return null;

  const born = parseIsoDateParts(birthday);
  if (!born) return null;

  const deathParts = deathday ? parseIsoDateParts(deathday) : null;
  const now = new Date();
  const end = deathParts ?? {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  };

  let age = end.year - born.year;
  const monthDelta = end.month - born.month;
  if (monthDelta < 0 || (monthDelta === 0 && end.day < born.day)) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};
