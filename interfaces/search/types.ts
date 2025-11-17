export interface SearchResult {
  id: number;
  title: string;
  overview: string;
  poster_url: string;
  vote_average: number;
  release_date: string;
  popularity: number;
  type: "movie" | "serie";
  original_language: string;
}
