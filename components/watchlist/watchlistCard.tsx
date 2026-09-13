import React from "react";
import Link from "next/link";
import { FaTimes } from "react-icons/fa";
import {
  FALLBACK_POSTER,
  ProvidersState,
  resolvePosterUrl,
  WatchlistItem,
} from "../../interfaces/watchlist/types";

interface WatchlistCardProps {
  item: WatchlistItem;
  providersState: ProvidersState;
  onRemove: () => void;
}

const typeLabel = { movie: "Filme", serie: "Série" };

const WatchlistCard: React.FC<WatchlistCardProps> = ({
  item,
  providersState,
  onRemove,
}) => {
  const href =
    item.type === "movie" ? `/movie/${item.idTmdb}` : `/serie/${item.idTmdb}`;
  const year = item.releaseDate ? item.releaseDate.slice(0, 4) : null;

  return (
    <div className="group relative">
      <Link href={href} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-white/[0.04]">
          <img
            src={resolvePosterUrl(item.posterPath)}
            alt={item.title}
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

          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-black/70 px-2 py-1 text-[0.6rem] font-black uppercase tracking-wide text-white/80"
          >
            {typeLabel[item.type]}
          </span>

          {item.watched && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-emerald-500/90 px-2 py-1 text-[0.6rem] font-black uppercase tracking-wide text-emerald-50"
            >
              Já assistido
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 text-sm font-bold text-white">
          {item.title}
        </p>
        {year && <p className="text-xs text-white/40">{year}</p>}
      </Link>

      <div className="mt-2 flex h-6 items-center gap-1.5">
        {providersState.kind === "pending" && (
          <span className="h-6 w-6 animate-pulse rounded-md bg-white/[0.08]" />
        )}
        {providersState.kind === "available" &&
          providersState.providers.map((provider) =>
            provider.logoPath ? (
              <img
                key={provider.id}
                src={provider.logoPath}
                alt={provider.name}
                title={provider.name}
                loading="lazy"
                className="h-6 w-6 rounded-md object-cover"
              />
            ) : null,
          )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover ${item.title} da watchlist`}
        className="absolute right-2 top-10 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white/70 opacity-100 transition-all duration-300 hover:bg-red-500/90 hover:text-white focus:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
      >
        <FaTimes size={12} />
      </button>
    </div>
  );
};

export default WatchlistCard;
