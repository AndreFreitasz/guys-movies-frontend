import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authFetch } from "../utils/authFetch";
import { useAuth } from "./authContext";
import { WatchedSeasonEntry } from "../components/series/seasonChecklist";

interface UseWatchedSeasonsOptions {
  idTmdb: number;
  buildPayload: () => unknown;
}

const AUTH_REQUIRED_MESSAGE =
  "Entre em uma conta para fazer atualizações na série";

export const useWatchedSeasons = ({
  idTmdb,
  buildPayload,
}: UseWatchedSeasonsOptions) => {
  const { user, authLoading } = useAuth();
  const [watchedSeasons, setWatchedSeasons] = useState<WatchedSeasonEntry[]>(
    [],
  );
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const requireUser = useCallback(() => {
    if (authLoading) return false;
    if (!user) {
      toast.warn(AUTH_REQUIRED_MESSAGE);
      return false;
    }
    return true;
  }, [authLoading, user]);

  const load = useCallback(async () => {
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/watchedSerie/isWatched?idTmdb=${idTmdb}`,
      );
      if (!response.ok) return;

      const data = await response.json();
      setWatchedSeasons(
        (data.seasons ?? []).map((season: any) => ({
          seasonNumber: season.seasonNumber,
          episodeCount: season.episodeCount ?? 0,
        })),
      );
      setCompletedAt(data.completedAt ?? null);
    } catch {
      return;
    }
  }, [idTmdb]);

  useEffect(() => {
    if (authLoading || !user) return;
    load();
  }, [authLoading, load, user]);

  const toggleSeason = useCallback(
    async (seasonNumber: number, watched: boolean, episodeCount = 0) => {
      if (!requireUser()) return;

      const previous = watchedSeasons;
      const previousCompleted = completedAt;

      setWatchedSeasons(
        watched
          ? [...previous, { seasonNumber, episodeCount }]
          : previous.filter((entry) => entry.seasonNumber !== seasonNumber),
      );
      setIsBusy(true);

      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/watchedSerie/season`,
          {
            method: watched ? "POST" : "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idTmdb,
              seasonNumber,
              ...(watched ? { createSerieDto: buildPayload() } : {}),
            }),
          },
        );

        if (!response.ok) throw new Error("falha");

        const progress = await response.json();
        setCompletedAt(progress.completedAt ?? null);
      } catch {
        setWatchedSeasons(previous);
        setCompletedAt(previousCompleted);
        toast.error("Não foi possível atualizar a temporada.");
      } finally {
        setIsBusy(false);
      }
    },
    [buildPayload, completedAt, idTmdb, requireUser, watchedSeasons],
  );

  const completeAll = useCallback(
    async (allSeasons: WatchedSeasonEntry[]) => {
      if (!requireUser()) return;

      const previous = watchedSeasons;
      const previousCompleted = completedAt;

      setWatchedSeasons(allSeasons);
      setIsBusy(true);

      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/watchedSerie/complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idTmdb, createSerieDto: buildPayload() }),
          },
        );

        if (!response.ok) throw new Error("falha");

        const progress = await response.json();
        setCompletedAt(progress.completedAt ?? null);
        toast.success("Série marcada como assistida!");
      } catch {
        setWatchedSeasons(previous);
        setCompletedAt(previousCompleted);
        toast.error("Não foi possível marcar a série.");
      } finally {
        setIsBusy(false);
      }
    },
    [buildPayload, completedAt, idTmdb, requireUser, watchedSeasons],
  );

  return {
    watchedSeasons,
    completedAt,
    isBusy,
    toggleSeason,
    completeAll,
    reload: load,
  };
};
