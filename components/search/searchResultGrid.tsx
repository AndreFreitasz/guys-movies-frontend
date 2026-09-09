import React from "react";
import MovieCard from "../home/movieCard";
import { SearchResult } from "../../interfaces/search/types";
import { UserLibrarySets } from "../../hooks/useUserLibrary";

interface SearchResultGridProps extends UserLibrarySets {
  results: SearchResult[];
}

type LibraryBadgeKind = "watched" | "watchlist" | null;

const getLibraryBadgeKind = (
  id: number,
  type: SearchResult["type"],
  library: UserLibrarySets,
): LibraryBadgeKind => {
  const watchedSet =
    type === "movie" ? library.watchedMovies : library.watchedSeries;
  const watchlistSet =
    type === "movie" ? library.watchlistMovies : library.watchlistSeries;

  if (watchedSet.has(id)) return "watched";
  if (watchlistSet.has(id)) return "watchlist";
  return null;
};

const LIBRARY_BADGE_STYLES: Record<Exclude<LibraryBadgeKind, null>, string> = {
  watched: "bg-emerald-500/90 text-emerald-50",
  watchlist: "bg-indigo-500/90 text-indigo-50",
};

const LIBRARY_BADGE_LABELS: Record<Exclude<LibraryBadgeKind, null>, string> = {
  watched: "Assistido",
  watchlist: "Na watchlist",
};

const LibraryBadge: React.FC<{ kind: LibraryBadgeKind }> = ({ kind }) => {
  if (!kind) return null;

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-2 top-2 z-10 rounded-full px-2 py-1 text-[0.6rem] font-black uppercase tracking-wide ${LIBRARY_BADGE_STYLES[kind]}`}
    >
      {LIBRARY_BADGE_LABELS[kind]}
    </span>
  );
};

const SearchResultGrid: React.FC<SearchResultGridProps> = ({
  results,
  watchedMovies,
  watchedSeries,
  watchlistMovies,
  watchlistSeries,
}) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
    {results.map((result) => {
      const badgeKind = getLibraryBadgeKind(result.id, result.type, {
        watchedMovies,
        watchedSeries,
        watchlistMovies,
        watchlistSeries,
      });

      return (
        <div key={`${result.type}-${result.id}`} className="relative isolate">
          <LibraryBadge kind={badgeKind} />
          <MovieCard
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
        </div>
      );
    })}
  </div>
);

export default SearchResultGrid;
export { getLibraryBadgeKind, LibraryBadge };
export type { LibraryBadgeKind };
