import React from "react";

export type SearchTypeFilterValue = "all" | "movie" | "serie";

interface SearchTypeFilterProps {
  value: SearchTypeFilterValue;
  onChange: (value: SearchTypeFilterValue) => void;
  counts: { all: number; movie: number; serie: number };
}

const OPTIONS: { value: SearchTypeFilterValue; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "movie", label: "Filmes" },
  { value: "serie", label: "Séries" },
];

const SearchTypeFilter: React.FC<SearchTypeFilterProps> = ({
  value,
  onChange,
  counts,
}) => (
  <div className="hide-scrollbar flex gap-2 overflow-x-auto">
    {OPTIONS.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={value === option.value}
        onClick={() => onChange(option.value)}
        className={`min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-medium transition ${
          value === option.value
            ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-100"
            : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
        }`}
      >
        {option.label}
        <span className="ml-2 tabular-nums text-white/40">
          {counts[option.value]}
        </span>
      </button>
    ))}
  </div>
);

export default SearchTypeFilter;
