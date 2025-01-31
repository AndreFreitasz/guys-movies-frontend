export interface Serie {
  id: number;
  name: string;
  poster_path: string;
  banner_url: string;
  overview: string;
  vote_average: number;
}

export interface Provider {
  id: number;
  logoUrl: string;
  name: string;
}

export interface ProviderData {
  provider: Provider;
  series: Serie[];
}

export interface SerieProps {
  providerData: ProviderData[];
  popularSeries: Serie[];
  popularSeriesHorror: Serie[];
  popularSeriesSciFi: Serie[];
  popularSeriesFamily: Serie[];
  topRatedSeries: Serie[];
  popularSeriesDrama: Serie[];
  popularSeriesSciFiDrama: Serie[];
  popularSeriesComedy: Serie[];
  error: string | null;
}
