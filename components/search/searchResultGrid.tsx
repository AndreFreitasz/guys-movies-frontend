import React from "react";
import MovieCard from "../home/movieCard";
import { SearchResult } from "../../interfaces/search/types";

interface SearchResultGridProps {
  results: SearchResult[];
}

const SearchResultGrid: React.FC<SearchResultGridProps> = ({ results }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
    {results.map((result) => (
      <MovieCard
        key={`${result.type}-${result.id}`}
        id={result.id}
        title={result.title}
        posterUrl={result.poster_url}
        overview={result.overview}
        vote_average={result.vote_average}
        href={
          result.type === "movie"
            ? `/movie/${result.id}`
            : `/serie/${result.id}`
        }
      />
    ))}
  </div>
);

export default SearchResultGrid;
