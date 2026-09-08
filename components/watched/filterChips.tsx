import React from "react";
import { WATCH_PROVIDERS } from "../../constants/watchProviders";

interface FilterChipsProps {
  ratings: number[];
  directors: string[];
  providers: number[];
  directorOptions: string[];
  showDirectors: boolean;
  onRatingsChange: (value: number[]) => void;
  onDirectorsChange: (value: string[]) => void;
  onProvidersChange: (value: number[]) => void;
  className?: string;
}

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];

const chipClass = (active: boolean) =>
  `min-h-[44px] rounded-full border px-4 text-sm transition ${
    active
      ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-100"
      : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
  }`;

const FilterChips: React.FC<FilterChipsProps> = ({
  ratings,
  directors,
  providers,
  directorOptions,
  showDirectors,
  onRatingsChange,
  onDirectorsChange,
  onProvidersChange,
  className,
}) => (
  <div className={`flex flex-wrap gap-2 ${className ?? ""}`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        aria-pressed={ratings.includes(star)}
        onClick={() => onRatingsChange(toggle(ratings, star))}
        className={chipClass(ratings.includes(star))}
      >
        {star} ★
      </button>
    ))}
    {WATCH_PROVIDERS.map((provider) => (
      <button
        key={provider.id}
        type="button"
        aria-pressed={providers.includes(provider.id)}
        onClick={() => onProvidersChange(toggle(providers, provider.id))}
        className={chipClass(providers.includes(provider.id))}
      >
        {provider.name}
      </button>
    ))}
    {showDirectors &&
      directorOptions.map((name) => (
        <button
          key={name}
          type="button"
          aria-pressed={directors.includes(name)}
          onClick={() => onDirectorsChange(toggle(directors, name))}
          className={chipClass(directors.includes(name))}
        >
          {name}
        </button>
      ))}
  </div>
);

export default FilterChips;
