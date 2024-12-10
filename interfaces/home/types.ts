export interface Movie {
  id: number;
  title: string;
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
  movies: Movie[];
}

export interface HomeProps {
  providerData: ProviderData[];
  popularMovies: Movie[];
  popularMoviesHorror: Movie[];
  popularMoviesSciFi: Movie[];
  popularMoviesFamily: Movie[];
  topRatedMovies: Movie[];
  popularMoviesDrama: Movie[];
  popularMoviesSciFiDrama: Movie[];
  popularMoviesComedy: Movie[];
  error: string | null;
}
