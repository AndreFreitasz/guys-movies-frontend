import React, { useMemo, useState } from "react";
import { WATCH_PROVIDERS } from "../../constants/watchProviders";
import { RatingRangeFilter } from "../../hooks/useWatchedFilters";
import RatingRangeSlider from "./ratingRangeSlider";

interface FilterSheetProps {
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
}

const DIRECTOR_SEARCH_THRESHOLD = 8;

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];

const pillClass = (active: boolean) =>
  `min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-medium transition ${
    active
      ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-100"
      : "border-white/10 bg-white/[0.03] text-white/60 active:bg-white/10"
  }`;

const Section: React.FC<{
  label: string;
  summary?: string;
  children: React.ReactNode;
}> = ({ label, summary, children }) => (
  <section className="border-t border-white/[0.07] pt-5 first:border-t-0 first:pt-0">
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/40">
        {label}
      </h3>
      {summary && (
        <span className="text-xs font-medium text-indigo-200">{summary}</span>
      )}
    </div>
    {children}
  </section>
);

const ratingSummary = (rating: RatingRangeFilter): string | undefined => {
  if (rating === null) return undefined;
  if (rating === "none") return "Sem nota";
  if (rating.min === rating.max) return `${rating.min}`;
  return `${rating.min} a ${rating.max}`;
};

const FilterSheet: React.FC<FilterSheetProps> = ({
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
    <div className="space-y-5">
      <Section label="Nota" summary={ratingSummary(rating)}>
        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={rating === null}
            onClick={() => onRatingChange(null)}
            className={`flex-1 ${pillClass(rating === null)}`}
          >
            Qualquer nota
          </button>
          <button
            type="button"
            aria-pressed={rating === "none"}
            onClick={() => onRatingChange("none")}
            className={`flex-1 ${pillClass(rating === "none")}`}
          >
            Sem nota
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl bg-white/[0.03] px-4 py-5">
          <RatingRangeSlider
            value={rating === "none" ? null : rating}
            onChange={onRatingChange}
            starClass="h-9 w-9"
          />
          <p className="text-xs text-white/35">
            Toque numa estrela ou arraste para definir um intervalo
          </p>
        </div>
      </Section>

      <Section label="Década" summary={decade ? `${decade}s` : undefined}>
        <div className="hide-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6">
          <button
            type="button"
            aria-pressed={decade === null}
            onClick={() => onDecadeChange(null)}
            className={pillClass(decade === null)}
          >
            Qualquer
          </button>
          {decadeOptions.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={decade === option}
              onClick={() => onDecadeChange(decade === option ? null : option)}
              className={pillClass(decade === option)}
            >
              {option}s
            </button>
          ))}
        </div>
      </Section>

      <Section
        label="Streaming"
        summary={providers.length ? `${providers.length}` : undefined}
      >
        <div className="flex flex-wrap gap-2">
          {WATCH_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              aria-pressed={providers.includes(provider.id)}
              onClick={() => onProvidersChange(toggle(providers, provider.id))}
              className={pillClass(providers.includes(provider.id))}
            >
              {provider.name}
            </button>
          ))}
        </div>
      </Section>

      {showDirectors && directorOptions.length > 0 && (
        <Section
          label="Diretor"
          summary={directors.length ? `${directors.length}` : undefined}
        >
          {directorOptions.length > DIRECTOR_SEARCH_THRESHOLD && (
            <input
              value={directorSearch}
              onChange={(event) => setDirectorSearch(event.target.value)}
              placeholder="Buscar diretor"
              aria-label="Buscar diretor"
              className="mb-3 min-h-[44px] w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/30 focus:border-indigo-400/50 focus:outline-none"
            />
          )}
          <div className="hide-scrollbar flex max-h-56 flex-wrap gap-2 overflow-y-auto">
            {filteredDirectorOptions.length === 0 ? (
              <p className="py-2 text-sm text-white/40">
                Nenhum diretor com esse nome na sua estante.
              </p>
            ) : (
              filteredDirectorOptions.map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={directors.includes(name)}
                  onClick={() => onDirectorsChange(toggle(directors, name))}
                  className={pillClass(directors.includes(name))}
                >
                  {name}
                </button>
              ))
            )}
          </div>
        </Section>
      )}
    </div>
  );
};

export default FilterSheet;
