import React from "react";
import { motion } from "framer-motion";
import { WatchedSortKey } from "../../interfaces/watched/types";

interface WatchedToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  sortKey: WatchedSortKey;
  onSortChange: (value: WatchedSortKey) => void;
  onlyRated: boolean;
  onOnlyRatedChange: (value: boolean) => void;
  resultCount: number;
}

const SORT_OPTIONS: Array<{ key: WatchedSortKey; label: string }> = [
  { key: "recent", label: "Recentes" },
  { key: "rating", label: "Nota" },
  { key: "title", label: "A-Z" },
  { key: "release", label: "Lançamento" },
];

const WatchedToolbar: React.FC<WatchedToolbarProps> = ({
  query,
  onQueryChange,
  sortKey,
  onSortChange,
  onlyRated,
  onOnlyRatedChange,
  resultCount,
}) => (
  <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
    <div className="relative w-full lg:max-w-xs">
      <svg
        viewBox="0 0 20 20"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
      >
        <path
          fill="currentColor"
          d="M8.5 2a6.5 6.5 0 015.1 10.6l4 4-1.1 1-4-4A6.5 6.5 0 118.5 2zm0 1.6a4.9 4.9 0 100 9.8 4.9 4.9 0 000-9.8z"
        />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Buscar nos assistidos..."
        aria-label="Buscar nos filmes assistidos"
        className="w-full rounded-2xl border border-white/10 bg-black/25 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 transition-all duration-300 ease-ios focus:border-indigo-400/60 focus:bg-black/40 focus:outline-none"
      />
    </div>

    <div className="hide-scrollbar -mx-1 flex items-center gap-3 overflow-x-auto px-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
      <div
        role="tablist"
        aria-label="Ordenar filmes"
        className="flex shrink-0 rounded-2xl border border-white/10 bg-black/25 p-1"
      >
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.key}
            role="tab"
            aria-selected={sortKey === option.key}
            onClick={() => onSortChange(option.key)}
            className="relative rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            {sortKey === option.key && (
              <motion.span
                layoutId="watched-sort-pill"
                transition={{ type: "spring", damping: 26, stiffness: 340 }}
                className="absolute inset-0 rounded-xl bg-white/12"
              />
            )}
            <span
              className={
                sortKey === option.key
                  ? "relative text-white"
                  : "relative text-white/50 hover:text-white/80"
              }
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onOnlyRatedChange(!onlyRated)}
        aria-pressed={onlyRated}
        className={`shrink-0 rounded-2xl border px-3.5 py-2 text-xs font-semibold transition ${
          onlyRated
            ? "border-amber-400/50 bg-amber-400/15 text-amber-200"
            : "border-white/10 bg-black/25 text-white/50 hover:text-white/80"
        }`}
      >
        Só avaliados
      </button>

      <span className="shrink-0 whitespace-nowrap text-xs font-medium tabular-nums text-white/40">
        {resultCount} {resultCount === 1 ? "filme" : "filmes"}
      </span>
    </div>
  </div>
);

export default WatchedToolbar;
