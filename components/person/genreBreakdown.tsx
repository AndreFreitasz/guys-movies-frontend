import React from "react";
import { GenreCount } from "../../interfaces/person/types";

interface GenreBreakdownProps {
  genres: GenreCount[];
  activeGenre: number | null;
  onSelect: (genreId: number | null) => void;
}

const MAX_GENRES = 8;

const GenreBreakdown: React.FC<GenreBreakdownProps> = ({
  genres,
  activeGenre,
  onSelect,
}) => {
  const visible = genres.slice(0, MAX_GENRES);
  if (!visible.length) return null;

  const maxCount = Math.max(...visible.map((genre) => genre.count));

  return (
    <section className="mt-10">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
        Gêneros · clique para filtrar
      </h2>
      <div className="mt-4 flex max-w-xl flex-col gap-2">
        {visible.map((genre) => {
          const isActive = genre.id === activeGenre;

          return (
            <button
              key={genre.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(isActive ? null : genre.id)}
              className="grid grid-cols-[88px_1fr_34px] items-center gap-3 rounded-md py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              <span
                className={`truncate text-xs transition-colors ${
                  isActive ? "font-bold text-white" : "text-white/60"
                }`}
              >
                {genre.name}
              </span>
              <span className="h-2 overflow-hidden rounded bg-white/7">
                <span
                  style={{ width: `${(genre.count / maxCount) * 100}%` }}
                  className={`block h-full rounded transition-colors ${
                    isActive ? "bg-indigo-400" : "bg-indigo-400/50"
                  }`}
                />
              </span>
              <span
                className={`text-right text-[11px] tabular-nums transition-colors ${
                  isActive ? "font-bold text-indigo-300" : "text-white/40"
                }`}
              >
                {genre.count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default GenreBreakdown;
