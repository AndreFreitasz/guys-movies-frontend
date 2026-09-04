import React from "react";
import { motion } from "framer-motion";
import { WatchedSerieItem } from "../../interfaces/watched/serieTypes";
import RatingStars from "./ratingStars";

interface WatchedSerieTileProps {
  serie: WatchedSerieItem;
  index: number;
  onSelect: (serie: WatchedSerieItem) => void;
}

const FALLBACK_POSTER = "/icons/home/cinema.png";

const WatchedSerieTile: React.FC<WatchedSerieTileProps> = ({
  serie,
  index,
  onSelect,
}) => (
  <motion.button
    type="button"
    onClick={() => onSelect(serie)}
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
      <img
        src={serie.posterPath || FALLBACK_POSTER}
        alt={serie.name ?? "Pôster da série"}
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

      {serie.rating !== null && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
          <svg viewBox="0 0 20 20" className="h-3 w-3">
            <path
              fill="currentColor"
              d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"
            />
          </svg>
          {serie.rating.toFixed(1)}
        </div>
      )}
    </div>

    <div className="relative -mt-14 flex flex-col gap-2 p-4">
      <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white">
        {serie.name ?? "Título indisponível"}
      </h3>
      <RatingStars rating={serie.rating} />

      <div className="mt-1">
        {serie.completedAt ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[0.65rem] font-bold text-emerald-200">
            Completa
          </span>
        ) : (
          <>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full rounded-full bg-indigo-400"
                style={{
                  width: `${
                    serie.numberOfSeasons
                      ? Math.min(
                          (serie.watchedSeasons / serie.numberOfSeasons) * 100,
                          100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="mt-1.5 text-xs font-medium text-white/45">
              {serie.watchedSeasons}/{serie.numberOfSeasons ?? "?"} temporadas
            </p>
          </>
        )}
      </div>
    </div>
  </motion.button>
);

export default React.memo(WatchedSerieTile);
