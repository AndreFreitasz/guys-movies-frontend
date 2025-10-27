export interface Serie {
  id: number;
  name: string;
  poster_path: string;
  overview?: string;
  first_air_date?: string;
  vote_average?: number;
}

import { CastMember, Providers } from "../movie/types";

export interface SerieResponse extends Serie {
  wallpaper_path: string;
  genres: string[];
  number_of_seasons: number;
  created_by: { name: string }[];
  providers: Providers;
  cast?: CastMember[];
}

export interface ProviderSeries {
  provider: {
    id: number;
    name: string;
    logoUrl: string;
  };
  series: Serie[];
}

export interface SerieProps {
  providerData: ProviderSeries[];
  error?: string;
}
