import React, { useMemo } from "react";
import { useAuth } from "../../hooks/authContext";
import { useUserLibrary } from "../../hooks/useUserLibrary";
import { PersonCredit } from "../../interfaces/person/types";

interface LibraryCrossoverProps {
  credits: PersonCredit[];
}

const LibraryCrossover: React.FC<LibraryCrossoverProps> = ({ credits }) => {
  const { isAuthenticated, authLoading } = useAuth();
  const { watchedMovies, isReady } = useUserLibrary();

  const movieIds = useMemo(
    () =>
      new Set(
        credits
          .filter((credit) => credit.mediaType === "movie")
          .map((credit) => credit.id),
      ),
    [credits],
  );

  const watchedCount = useMemo(() => {
    let count = 0;
    movieIds.forEach((id) => {
      if (watchedMovies.has(id)) count += 1;
    });
    return count;
  }, [movieIds, watchedMovies]);

  if (authLoading || (isAuthenticated && !isReady)) {
    return <div className="skeleton mt-8 h-[68px] w-full rounded-2xl" />;
  }

  if (!isAuthenticated) {
    return (
      <p className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/50">
        Entre na sua conta para ver quantos filmes dessa pessoa você já
        assistiu.
      </p>
    );
  }

  const total = movieIds.size;
  if (!total) return null;

  const percent = Math.round((watchedCount / total) * 100);

  return (
    <section className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/8 px-5 py-4">
      <span className="text-2xl font-extrabold tabular-nums leading-none text-emerald-300">
        {watchedCount}/{total}
      </span>
      <span className="text-sm text-white/60">
        filmes dessa pessoa que você já assistiu
      </span>
      <span className="h-2 min-w-[150px] flex-1 overflow-hidden rounded bg-white/9">
        <span
          style={{ width: `${percent}%` }}
          className="block h-full rounded bg-emerald-400"
        />
      </span>
    </section>
  );
};

export default LibraryCrossover;
