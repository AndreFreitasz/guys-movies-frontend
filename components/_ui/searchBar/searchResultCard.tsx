import { memo } from "react";
import Link from "next/link";
import { FaFilm, FaTv, FaStar } from "react-icons/fa";
import { SearchResult } from "../../../interfaces/search/types";

interface SearchResultCardProps {
  result: SearchResult;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const SearchResultCard = memo(
  ({ result, onMouseDown }: SearchResultCardProps) => {
    const isMovie = result.type === "movie";
    const href = isMovie ? `/movie/${result.id}` : `/serie/${result.id}`;

    const formattedDate = result.release_date
      ? new Date(result.release_date).toLocaleDateString("pt-BR", {
          year: "numeric",
          month: "short",
        })
      : "Data não disponível";

    const TypeIcon = isMovie ? FaFilm : FaTv;
    const typeLabel = isMovie ? "Filme" : "Série";
    const typeBgColor = isMovie ? "bg-blue-500/20" : "bg-purple-500/20";
    const typeTextColor = isMovie ? "text-blue-300" : "text-purple-300";
    const typeBorderColor = isMovie
      ? "border-blue-400/40"
      : "border-purple-400/40";

    return (
      <Link href={href}>
        <li
          onMouseDown={onMouseDown}
          className="group relative flex gap-4 px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-200 border-b border-white/5 last:border-b-0"
        >
          {/* Poster */}
          <div className="relative flex-shrink-0 w-16 h-24 overflow-hidden rounded-lg border border-white/10 bg-black/40">
            {result.poster_url ? (
              <img
                src={result.poster_url}
                alt={result.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/30">
                <TypeIcon size={24} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            {/* Title and Type Badge */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 flex-1 group-hover:text-indigo-200 transition-colors">
                  {result.title}
                </h3>
                <span
                  className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${typeBgColor} ${typeTextColor} ${typeBorderColor}`}
                >
                  <TypeIcon size={10} />
                  {typeLabel}
                </span>
              </div>

              {/* Overview */}
              {result.overview && (
                <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                  {result.overview}
                </p>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-3 text-xs text-white/40">
              {/* Rating */}
              {result.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" size={11} />
                  <span className="font-medium text-white/60">
                    {result.vote_average.toFixed(1)}
                  </span>
                </div>
              )}

              {/* Release Date */}
              <span className="hidden sm:inline">{formattedDate}</span>

              {/* Language Badge */}
              {result.original_language && (
                <span className="uppercase font-semibold text-white/30 hidden md:inline">
                  {result.original_language}
                </span>
              )}
            </div>
          </div>
        </li>
      </Link>
    );
  },
);

SearchResultCard.displayName = "SearchResultCard";

export default SearchResultCard;
