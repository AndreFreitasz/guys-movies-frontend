import React, { useMemo, useState } from "react";
import { WATCH_PROVIDERS } from "../../constants/watchProviders";
import { RatingRangeFilter } from "../../hooks/useWatchedFilters";
import FilterDropdown from "./filterDropdown";
import RatingRangeSlider from "./ratingRangeSlider";

interface FilterBarProps {
  rating: RatingRangeFilter;
  decade: number | null;
  directors: string[];
  providers: number[];
  decadeOptions: number[];
  directorOptions: string[];
  showDirectors: boolean;
  onRatingChange: (value: RatingRangeFilter) => void;
  onDecadeChange: (value: number | null) => void;
  onDirectorsChange: (value: string[]) => void;
  onProvidersChange: (value: number[]) => void;
  className?: string;
}

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];

const optionRowClass = (active: boolean) =>
  `flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
    active
      ? "bg-indigo-500/20 text-indigo-100"
      : "text-white/70 hover:bg-white/[0.06] hover:text-white"
  }`;

const DIRECTOR_SEARCH_THRESHOLD = 15;

const ratingLabel = (rating: RatingRangeFilter): string => {
  if (rating === null) return "Nota";
  if (rating === "none") return "Sem nota";
  if (rating.min === rating.max) return `Nota ${rating.min}`;
  return `Nota ${rating.min}–${rating.max}`;
};

const FilterBar: React.FC<FilterBarProps> = ({
  rating,
  decade,
  directors,
  providers,
  decadeOptions,
  directorOptions,
  showDirectors,
  onRatingChange,
  onDecadeChange,
  onDirectorsChange,
  onProvidersChange,
  className,
}) => {
  const [directorSearch, setDirectorSearch] = useState("");

  const filteredDirectorOptions = useMemo(() => {
    const normalized = directorSearch.trim().toLowerCase();
    if (!normalized) return directorOptions;
    return directorOptions.filter((name) =>
      name.toLowerCase().includes(normalized),
    );
  }, [directorOptions, directorSearch]);

  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      <FilterDropdown label={ratingLabel(rating)} isActive={rating !== null}>
        {(close) => (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                onRatingChange(null);
                close();
              }}
              className={optionRowClass(rating === null)}
            >
              Qualquer nota
            </button>
            <button
              type="button"
              onClick={() => {
                onRatingChange("none");
                close();
              }}
              className={optionRowClass(rating === "none")}
            >
              Sem nota
            </button>

            <div className="mt-2 border-t border-white/10 pt-3">
              <p className="text-xs font-semibold text-white/70">
                Nota (ou intervalo)
              </p>
              <p className="mt-0.5 text-[11px] text-white/40">
                Arraste para definir um intervalo
              </p>
              <div className="mt-3 px-1">
                <RatingRangeSlider
                  value={rating !== null && rating !== "none" ? rating : null}
                  onChange={onRatingChange}
                />
              </div>
            </div>
          </div>
        )}
      </FilterDropdown>

      <FilterDropdown
        label={decade !== null ? `${decade}s` : "Década"}
        isActive={decade !== null}
      >
        {(close) => (
          <div className="max-h-72 space-y-1 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onDecadeChange(null);
                close();
              }}
              className={optionRowClass(decade === null)}
            >
              Qualquer década
            </button>
            {decadeOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onDecadeChange(option);
                  close();
                }}
                className={optionRowClass(decade === option)}
              >
                {option}s
              </button>
            ))}
          </div>
        )}
      </FilterDropdown>

      <FilterDropdown
        label="Streaming"
        badge={providers.length}
        isActive={providers.length > 0}
      >
        {() => (
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {WATCH_PROVIDERS.map((provider) => {
              const active = providers.includes(provider.id);
              return (
                <button
                  key={provider.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onProvidersChange(toggle(providers, provider.id))
                  }
                  className={optionRowClass(active)}
                >
                  {provider.name}
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      active
                        ? "border-indigo-300 bg-indigo-400 text-[#05050c]"
                        : "border-white/25"
                    }`}
                  >
                    {active && (
                      <svg viewBox="0 0 20 20" className="h-3 w-3">
                        <path
                          fill="currentColor"
                          d="M8.2 13.2L4.9 9.9l1.2-1.2 2.1 2.1 5.7-5.7 1.2 1.2z"
                        />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </FilterDropdown>

      {showDirectors && (
        <FilterDropdown
          label="Diretor"
          badge={directors.length}
          isActive={directors.length > 0}
        >
          {() => (
            <div>
              {directorOptions.length > DIRECTOR_SEARCH_THRESHOLD && (
                <input
                  type="search"
                  value={directorSearch}
                  onChange={(event) => setDirectorSearch(event.target.value)}
                  placeholder="Buscar diretor..."
                  aria-label="Buscar diretor"
                  className="mb-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-indigo-400/60 focus:outline-none"
                />
              )}
              <div className="max-h-72 space-y-1 overflow-y-auto">
                {filteredDirectorOptions.map((name) => {
                  const active = directors.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onDirectorsChange(toggle(directors, name))}
                      className={optionRowClass(active)}
                    >
                      {name}
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          active
                            ? "border-indigo-300 bg-indigo-400 text-[#05050c]"
                            : "border-white/25"
                        }`}
                      >
                        {active && (
                          <svg viewBox="0 0 20 20" className="h-3 w-3">
                            <path
                              fill="currentColor"
                              d="M8.2 13.2L4.9 9.9l1.2-1.2 2.1 2.1 5.7-5.7 1.2 1.2z"
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })}
                {filteredDirectorOptions.length === 0 && (
                  <p className="px-3 py-2 text-sm text-white/40">
                    Nenhum diretor encontrado.
                  </p>
                )}
              </div>
            </div>
          )}
        </FilterDropdown>
      )}
    </div>
  );
};

export default FilterBar;
