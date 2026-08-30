import { memo } from "react";
import CircularVoteAverage from "../home/movieCard/circularVoteAverage";

interface MediaHeroHeaderProps {
  badgeLabel: string;
  title: string;
  voteAverage: number;
}

const MediaHeroHeader = memo(
  ({ badgeLabel, title, voteAverage }: MediaHeroHeaderProps) => {
    return (
      <header className="flex min-w-0 flex-col gap-3 lg:gap-5">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-indigo-300 sm:text-[0.65rem]">
          {badgeLabel}
        </p>
        <h1 className="break-words text-2xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
          {title}
        </h1>
        <div className="flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur sm:gap-4 sm:px-4 sm:py-3">
          <CircularVoteAverage vote_average={voteAverage} compact />
          <div className="flex flex-col text-[0.6rem] uppercase tracking-[0.25em] text-white/60 sm:text-xs sm:tracking-[0.3em]">
            <span>Score</span>
            <span className="font-semibold text-white">TMDB</span>
          </div>
        </div>
      </header>
    );
  },
);

MediaHeroHeader.displayName = "MediaHeroHeader";

export default MediaHeroHeader;
