import { memo } from "react";
import CircularVoteAverage from "../home/movieCard/circularVoteAverage";

interface MediaHeroHeaderProps {
  badgeLabel: string;
  title: string;
  overview: string;
  voteAverage: number;
}

const MediaHeroHeader = memo(
  ({ badgeLabel, title, overview, voteAverage }: MediaHeroHeaderProps) => {
    return (
      <header className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-indigo-300">
              {badgeLabel}
            </p>
            <h1 className="text-3xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
            <CircularVoteAverage vote_average={voteAverage} />
            <div className="flex flex-col text-xs uppercase tracking-[0.3em] text-white/60">
              <span>Score</span>
              <span className="font-semibold text-white">TMDB</span>
            </div>
          </div>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-white/60 sm:text-base lg:text-lg">
          {overview}
        </p>
      </header>
    );
  },
);

MediaHeroHeader.displayName = "MediaHeroHeader";

export default MediaHeroHeader;
