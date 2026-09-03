export interface Serie {
  id: number;
  name: string;
  poster_path: string;
  overview?: string;
  first_air_date?: string;
  vote_average?: number;
}

import { CastMember, Providers } from "../movie/types";

export interface SerieSeason {
  season_number: number;
  name: string;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
}

export interface SerieResponse extends Serie {
  wallpaper_path: string;
  genres: string[];
  number_of_seasons: number;
  created_by: { name: string }[];
  providers: Providers;
  cast?: CastMember[];
  seasons?: SerieSeason[];
}

export interface ProviderSeries {
  provider: {
    id: number;
    name: string;
    logoUrl: string;
  };
  series: Serie[];
}

export interface HeroSerie {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  backdrop_path: string | null;
  poster_path: string | null;
  first_air_date: string | null;
}

export interface SerieProps {
  providerData: ProviderSeries[];
  popularSeries: HeroSerie[];
  error?: string;
}
