import { memo } from "react";

export interface CriticScores {
  rottenTomatoes: number | null;
  metacritic: number | null;
}

interface ScoreChipsProps {
  tmdb?: number | null;
  criticScores?: CriticScores;
}

const CHIP =
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.7rem] font-extrabold tracking-tight";

const ScoreChips = memo(({ tmdb, criticScores }: ScoreChipsProps) => {
  const rotten = criticScores?.rottenTomatoes;
  const meta = criticScores?.metacritic;

  return (
    <>
      {typeof tmdb === "number" && tmdb > 0 && (
        <span className={`${CHIP} bg-emerald-500/15 text-emerald-300`}>
          TMDB {tmdb.toFixed(1)}
        </span>
      )}
      {typeof rotten === "number" && (
        <span className={`${CHIP} bg-red-500/15 text-red-300`}>
          Tomatoes {rotten}%
        </span>
      )}
      {typeof meta === "number" && (
        <span className={`${CHIP} bg-amber-400/15 text-amber-300`}>
          Metacritic {meta}
        </span>
      )}
    </>
  );
});

ScoreChips.displayName = "ScoreChips";

export default ScoreChips;
