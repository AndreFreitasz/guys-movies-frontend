import React from "react";
import { motion } from "framer-motion";
import { WatchedMovieItem } from "../../interfaces/watched/types";
import RatingStars from "./ratingStars";

interface WatchedTileProps {
  movie: WatchedMovieItem;
  index: number;
  onSelect: (movie: WatchedMovieItem) => void;
}

const FALLBACK_POSTER = "/icons/home/cinema.png";

export const formatWatchedDate = (value: string | null): string => {
  if (!value) return "Data não registrada";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não registrada";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const WatchedTile: React.FC<WatchedTileProps> = ({
  movie,
  index,
  onSelect,
}) => (
  <motion.button
    type="button"
    layoutId={`watched-${movie.idTmdb}`}
    onClick={() => onSelect(movie)}
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.45,
      delay: Math.min(index * 0.035, 0.4),
      ease: [0.16, 1, 0.3, 1],
    }}
    whileHover={{ y: -6 }}
    whileTap={{ scale: 0.97 }}
    className="group relative flex w-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] text-left backdrop-blur-xl transition-colors duration-300 hover:border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
  >
    <div className="relative aspect-[2/3] w-full overflow-hidden">
      <motion.img
        layoutId={`watched-poster-${movie.idTmdb}`}
        src={movie.posterPath || FALLBACK_POSTER}
        alt={movie.title ?? "Pôster do filme"}
        loading="lazy"
        decoding="async"
        onError={(event) => {
          const target = event.currentTarget;
          if (target.src.endsWith(FALLBACK_POSTER)) return;
          target.src = FALLBACK_POSTER;
          target.classList.add("object-contain", "p-6", "opacity-40");
        }}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

      {movie.rating !== null && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
          <svg viewBox="0 0 20 20" className="h-3 w-3">
            <path
              fill="currentColor"
              d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"
            />
          </svg>
          {movie.rating.toFixed(1)}
        </div>
      )}
    </div>

    <div className="relative -mt-14 flex flex-col gap-2 p-4">
      <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white">
        {movie.title ?? "Título indisponível"}
      </h3>
      <RatingStars rating={movie.rating} />
      <p className="text-xs font-medium text-white/45">
        {formatWatchedDate(movie.watchedAt)}
      </p>
    </div>
  </motion.button>
);

export default React.memo(WatchedTile);
