import React, { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { WatchedMovieItem } from "../../interfaces/watched/types";
import RatingStars from "./ratingStars";
import { formatWatchedDate } from "./watchedTile";

interface WatchedDetailSheetProps {
  movie: WatchedMovieItem | null;
  onClose: () => void;
}

const FALLBACK_POSTER = "/icons/home/cinema.png";

const formatReleaseYear = (value: string | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : String(date.getFullYear());
};

const DetailRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
      {label}
    </span>
    <span className="text-right text-sm font-medium text-white/85">
      {value}
    </span>
  </div>
);

const WatchedDetailSheet: React.FC<WatchedDetailSheetProps> = ({
  movie,
  onClose,
}) => {
  useEffect(() => {
    if (!movie) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [movie, onClose]);

  return (
    <AnimatePresence>
      {movie && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            layoutId={`watched-${movie.idTmdb}`}
            role="dialog"
            aria-modal="true"
            aria-label={movie.title ?? "Detalhes do filme"}
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#0a0a16]/95 shadow-lift backdrop-blur-2xl sm:rounded-[2rem]"
          >
            <div className="sticky top-0 z-10 flex justify-center bg-gradient-to-b from-[#0a0a16] to-transparent pb-4 pt-3 sm:hidden">
              <span className="h-1.5 w-12 rounded-full bg-white/25" />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar detalhes"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4">
                <path
                  fill="currentColor"
                  d="M5.3 4.3l4.7 4.7 4.7-4.7 1 1-4.7 4.7 4.7 4.7-1 1-4.7-4.7-4.7 4.7-1-1 4.7-4.7-4.7-4.7z"
                />
              </svg>
            </button>

            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
              <motion.img
                layoutId={`watched-poster-${movie.idTmdb}`}
                src={movie.posterPath || FALLBACK_POSTER}
                alt={movie.title ?? "Pôster do filme"}
                onError={(event) => {
                  const target = event.currentTarget;
                  if (target.src.endsWith(FALLBACK_POSTER)) return;
                  target.src = FALLBACK_POSTER;
                  target.classList.add("opacity-40");
                }}
                className="mx-auto w-40 rounded-2xl shadow-xl sm:mx-0 sm:w-52"
              />

              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-300">
                  Assistido
                </p>
                <h2 className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {movie.title ?? "Título indisponível"}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <RatingStars rating={movie.rating} size="md" />
                  {movie.rating !== null && (
                    <span className="text-sm font-semibold text-amber-300">
                      {movie.rating.toFixed(1)} / 5
                    </span>
                  )}
                </div>

                {movie.overview && (
                  <p className="mt-4 text-sm leading-relaxed text-white/65">
                    {movie.overview}
                  </p>
                )}

                <div className="mt-5">
                  <DetailRow
                    label="Você assistiu em"
                    value={formatWatchedDate(movie.watchedAt)}
                  />
                  <DetailRow
                    label="Lançamento"
                    value={formatReleaseYear(movie.releaseDate)}
                  />
                  <DetailRow
                    label="Direção"
                    value={movie.director ?? "Não informado"}
                  />
                  <DetailRow
                    label="Nota TMDB"
                    value={
                      movie.voteAverage !== null
                        ? `${movie.voteAverage.toFixed(1)} / 10`
                        : "—"
                    }
                  />
                </div>

                <Link
                  href={`/movie/${movie.idTmdb}`}
                  className="group mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96]"
                >
                  Abrir página do filme
                  <svg viewBox="0 0 20 20" className="h-4 w-4">
                    <path
                      fill="currentColor"
                      d="M7.5 4.5l5.5 5.5-5.5 5.5-1-1 4.5-4.5-4.5-4.5z"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WatchedDetailSheet;
