import React, { useState } from "react";
import { FaCheck, FaPlus } from "react-icons/fa";

export interface SeasonOption {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airDate: string | null;
  posterPath: string | null;
}

export interface WatchedSeasonEntry {
  seasonNumber: number;
  episodeCount: number;
}

interface SeasonChecklistProps {
  seasons: SeasonOption[];
  watchedSeasons: WatchedSeasonEntry[];
  isBusy: boolean;
  completedAt: string | null;
  onToggle: (
    seasonNumber: number,
    watched: boolean,
    episodeCount: number,
  ) => void;
  onCompleteAll: () => void;
}

const VISIBLE_LIMIT = 8;

const formatYear = (value: string | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : String(date.getFullYear());
};

const formatCompletedAt = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const SeasonChecklist: React.FC<SeasonChecklistProps> = ({
  seasons,
  watchedSeasons,
  isBusy,
  completedAt,
  onToggle,
  onCompleteAll,
}) => {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? seasons : seasons.slice(0, VISIBLE_LIMIT);
  const watchedSeasonNumbers = new Set(
    watchedSeasons.map((entry) => entry.seasonNumber),
  );
  const watchedEpisodes = watchedSeasons.reduce(
    (total, entry) => total + entry.episodeCount,
    0,
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-indigo-300">
            Temporadas
          </p>
          <p className="mt-1 text-sm font-semibold text-white/80">
            {watchedSeasons.length} de {seasons.length}{" "}
            {seasons.length === 1 ? "temporada" : "temporadas"} ·{" "}
            {watchedEpisodes} {watchedEpisodes === 1 ? "episódio" : "episódios"}
          </p>
        </div>

        {completedAt ? (
          <span className="flex h-10 items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/20 px-4 text-xs font-bold text-emerald-200">
            <FaCheck size={11} />
            Série completa · {formatCompletedAt(completedAt)}
          </span>
        ) : (
          seasons.length > 0 && (
            <button
              type="button"
              onClick={onCompleteAll}
              disabled={isBusy}
              className="h-10 rounded-full bg-white px-5 text-xs font-bold tracking-tight text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40"
            >
              Assisti a série inteira
            </button>
          )
        )}
      </div>

      <ul className="mt-4 space-y-1.5">
        {visible.map((season) => {
          const isWatched = watchedSeasonNumbers.has(season.seasonNumber);

          return (
            <li key={season.seasonNumber}>
              <button
                type="button"
                onClick={() =>
                  onToggle(season.seasonNumber, !isWatched, season.episodeCount)
                }
                disabled={isBusy}
                aria-pressed={isWatched}
                className={`flex min-h-[44px] w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition-colors duration-300 disabled:opacity-50 ${
                  isWatched
                    ? "border-emerald-400/30 bg-emerald-400/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25"
                }`}
              >
                <img
                  src={season.posterPath ?? "/icons/home/cinema.png"}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-8 shrink-0 rounded-md object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {season.name}
                  </span>
                  <span className="block text-xs text-white/45">
                    {season.episodeCount}{" "}
                    {season.episodeCount === 1 ? "episódio" : "episódios"} ·{" "}
                    {formatYear(season.airDate)}
                  </span>
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                    isWatched
                      ? "border-emerald-400/40 bg-emerald-400/20 text-emerald-200"
                      : "border-white/15 text-white/35"
                  }`}
                >
                  {isWatched ? <FaCheck size={11} /> : <FaPlus size={10} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {seasons.length > VISIBLE_LIMIT && (
        <button
          type="button"
          onClick={() => setShowAll((previous) => !previous)}
          className="mt-3 text-xs font-bold text-indigo-300 transition-colors hover:text-indigo-200"
        >
          {showAll
            ? "Mostrar menos"
            : `Ver todas as ${seasons.length} temporadas`}
        </button>
      )}
    </section>
  );
};

export default SeasonChecklist;
