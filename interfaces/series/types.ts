export interface Serie {
  id: number;
  name: string;
  poster_path: string;
  overview?: string;
  first_air_date?: string;
  vote_average?: number;
}

export interface SerieResponse extends Serie {
  wallpaper_path: string;
  genres: string[];
  number_of_seasons: number;
  created_by: { name: string }[];
  providers: {
    flatrate: any[];
    buy: any[];
    rent: any[];
  };
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
