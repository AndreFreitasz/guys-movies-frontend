import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaFilm, FaTv, FaStar } from "react-icons/fa";
import { SearchResult } from "../../../interfaces/search/types";

interface SearchResultCardProps {
  result: SearchResult;
  index?: number;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const SearchResultCard = memo(
  ({ result, index = 0, onMouseDown }: SearchResultCardProps) => {
    const isMovie = result.type === "movie";
    const href = isMovie ? `/movie/${result.id}` : `/serie/${result.id}`;

    const formattedDate = result.release_date
      ? new Date(result.release_date).toLocaleDateString("pt-BR", {
          year: "numeric",
          month: "short",
        })
      : "Sem data";

    const TypeIcon = isMovie ? FaFilm : FaTv;
    const typeLabel = isMovie ? "Filme" : "Série";
    const typeStyles = isMovie
      ? "bg-sky-400/15 text-sky-200 border-sky-300/25"
      : "bg-fuchsia-400/15 text-fuchsia-200 border-fuchsia-300/25";

    return (
      <motion.li
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.35,
          delay: Math.min(index, 6) * 0.04,
          ease: [0.32, 0.72, 0, 1],
        }}
        onMouseDown={onMouseDown}
        className="border-b border-white/[0.05] last:border-b-0"
      >
        <Link
          href={href}
          className="group flex gap-3.5 px-4 py-3 transition-colors duration-200 hover:bg-white/[0.05]"
        >
          <div className="relative h-[4.5rem] w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
            {result.poster_url ? (
              <img
                src={result.poster_url}
                alt={result.title}
                className="h-full w-full object-cover transition-transform duration-500 ease-ios group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/25">
                <TypeIcon size={20} />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <h3 className="line-clamp-2 flex-1 text-sm font-bold leading-snug text-white transition-colors duration-200 group-hover:text-indigo-200">
                  {result.title}
                </h3>
                <span
                  className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider ${typeStyles}`}
                >
                  <TypeIcon size={9} />
                  {typeLabel}
                </span>
              </div>

              {result.overview && (
                <p className="line-clamp-2 text-xs leading-relaxed text-white/40">
                  {result.overview}
                </p>
              )}
            </div>

            <div className="mt-1.5 flex items-center gap-3 text-[0.7rem] text-white/35">
              {result.vote_average > 0 && (
                <span className="flex items-center gap-1">
                  <FaStar className="text-amber-400" size={10} />
                  <span className="font-bold text-white/60">
                    {result.vote_average.toFixed(1)}
                  </span>
                </span>
              )}
              <span>{formattedDate}</span>
              {result.original_language && (
                <span className="hidden font-bold uppercase text-white/25 sm:inline">
                  {result.original_language}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.li>
    );
  },
);

SearchResultCard.displayName = "SearchResultCard";

export default SearchResultCard;
