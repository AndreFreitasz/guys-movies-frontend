import { memo } from "react";
import ScoreChips, { CriticScores } from "./scoreChips";
import { formatYear } from "../../utils/formatYear";

interface MediaHeroHeaderProps {
  badgeLabel: string;
  title: string;
  voteAverage: number;
  mediaId: number;
  date?: string | null;
  runtimeLabel?: string | null;
  criticScores?: CriticScores;
  overview?: string;
}

const MediaHeroHeader = memo(
  ({
    badgeLabel,
    title,
    voteAverage,
    date,
    runtimeLabel,
    criticScores,
    overview,
  }: MediaHeroHeaderProps) => {
    const year = formatYear(date);

    return (
      <header className="flex min-w-0 flex-col gap-3 lg:gap-4">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-indigo-300 sm:text-[0.65rem]">
          {badgeLabel}
        </p>

        <h1 className="wrap-break-word text-2xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-white/55">
          {year && <span>{year}</span>}
          {runtimeLabel && <span>{runtimeLabel}</span>}
          <ScoreChips tmdb={voteAverage} criticScores={criticScores} />
        </div>

        {overview?.trim() && (
          <p className="max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base sm:leading-relaxed">
            {overview}
          </p>
        )}
      </header>
    );
  },
);

MediaHeroHeader.displayName = "MediaHeroHeader";

export default MediaHeroHeader;
