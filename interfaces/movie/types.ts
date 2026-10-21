export interface CastMember {
  id?: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface Director {
  id?: number;
  name: string;
  profile_path: string;
}

export interface ProviderDetail {
  provider_name: string;
  logo_path: string;
  id_provider: number;
}

export interface Providers {
  flatrate?: ProviderDetail[];
  buy?: ProviderDetail[];
  rent?: ProviderDetail[];
}

export interface MovieResponse {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  wallpaper_path: string;
  vote_average: number;
  release_date: string;
  genres: string[];
  adult: boolean;
  cast?: CastMember[];
  director?: Director;
  providers: Providers;
  critic_scores?: {
    rottenTomatoes: number | null;
    metacritic: number | null;
  };
}
