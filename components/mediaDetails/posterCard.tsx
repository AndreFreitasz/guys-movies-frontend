import { memo, ReactNode } from "react";
import { FaPlus } from "react-icons/fa";

interface MediaPosterCardProps {
  posterUrl: string;
  title: string;
  onWatchlistToggle: () => void;
  isInWatchlist: boolean;
  isLoading: boolean;
  watchlistLabels: {
    active: string;
    inactive: string;
  };
  badge?: ReactNode;
}

const MediaPosterCard = memo(
  ({
    posterUrl,
    title,
    onWatchlistToggle,
    isInWatchlist,
    isLoading,
    watchlistLabels,
    badge,
  }: MediaPosterCardProps) => {
    return (
      <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-2xl shadow-indigo-900/40 backdrop-blur">
        <img
          src={posterUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <button
          type="button"
          onClick={onWatchlistToggle}
          disabled={isLoading}
          className={`group/button absolute right-4 top-4 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide backdrop-blur transition ${
            isInWatchlist
              ? "bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300/60 hover:bg-emerald-400/30"
              : "bg-white/10 text-white hover:bg-white/20"
          } ${isLoading ? "opacity-70" : ""}`}
        >
          <FaPlus
            className={`text-base transition duration-300 ${
              isInWatchlist ? "rotate-45 text-emerald-200" : ""
            }`}
          />
          <span>
            {isInWatchlist ? watchlistLabels.active : watchlistLabels.inactive}
          </span>
        </button>
        {badge}
      </div>
    );
  },
);

MediaPosterCard.displayName = "MediaPosterCard";

export default MediaPosterCard;
