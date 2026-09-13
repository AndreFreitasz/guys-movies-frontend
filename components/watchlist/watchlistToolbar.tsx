import React from "react";
import FilterDropdown from "../watched/filterDropdown";
import { WATCH_PROVIDERS } from "../../constants/watchProviders";
import {
  WatchlistItemType,
  WatchlistSort,
  WatchlistStats,
  WATCHLIST_SORTS,
} from "../../interfaces/watchlist/types";

interface WatchlistToolbarProps {
  stats: WatchlistStats;
  sort: WatchlistSort;
  onSortChange: (sort: WatchlistSort) => void;
  typeFilter: WatchlistItemType | null;
  onTypeChange: (type: WatchlistItemType | null) => void;
  providerIds: number[];
  onProvidersChange: (ids: number[]) => void;
  isAvailabilityLoading: boolean;
  onClear: () => void;
  activeCount: number;
  onShuffle: () => void;
  canShuffle: boolean;
}

const optionClass = (isActive: boolean) =>
  `w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
    isActive
      ? "bg-white/10 font-bold text-white"
      : "text-white/60 hover:bg-white/5"
  }`;

const WatchlistToolbar: React.FC<WatchlistToolbarProps> = ({
  stats,
  sort,
  onSortChange,
  typeFilter,
  onTypeChange,
  providerIds,
  onProvidersChange,
  isAvailabilityLoading,
  onClear,
  activeCount,
  onShuffle,
  canShuffle,
}) => {
  const toggleProvider = (id: number) => {
    onProvidersChange(
      providerIds.includes(id)
        ? providerIds.filter((current) => current !== id)
        : [...providerIds, id],
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown label="Ordenar" isActive={sort !== "recent"}>
        {(close) => (
          <div className="space-y-1">
            {WATCHLIST_SORTS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={optionClass(sort === option.value)}
                onClick={() => {
                  onSortChange(option.value);
                  close();
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </FilterDropdown>

      <FilterDropdown label="Tipo" isActive={typeFilter !== null}>
        {(close) => (
          <div className="space-y-1">
            {[
              { value: null, label: `Tudo (${stats.total})` },
              { value: "movie" as const, label: `Filmes (${stats.movies})` },
              { value: "serie" as const, label: `Séries (${stats.series})` },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                className={optionClass(typeFilter === option.value)}
                onClick={() => {
                  onTypeChange(option.value);
                  close();
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </FilterDropdown>

      {isAvailabilityLoading ? (
        <span className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/35">
          Carregando streamings...
        </span>
      ) : (
        <FilterDropdown
          label="Streaming"
          badge={providerIds.length || undefined}
          isActive={providerIds.length > 0}
        >
          {() => (
            <div className="space-y-1">
              {WATCH_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  className={optionClass(providerIds.includes(provider.id))}
                  onClick={() => toggleProvider(provider.id)}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          )}
        </FilterDropdown>
      )}

      <button
        type="button"
        onClick={onShuffle}
        disabled={!canShuffle}
        className="rounded-2xl bg-indigo-500/90 px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Escolhe por mim
      </button>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-2xl px-4 py-2 text-sm font-bold text-white/50 transition-colors hover:text-white"
        >
          Limpar tudo
        </button>
      )}
    </div>
  );
};

export default WatchlistToolbar;
